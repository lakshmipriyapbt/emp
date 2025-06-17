import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import LayOut from '../../LayOut/LayOut';
import { Link } from 'react-router-dom';

const CandidateDocumentUpload = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const resumeRef = useRef(null);
    const idProofRef = useRef(null);
    const tenthRef = useRef(null);
    const twelfthRef = useRef(null);
    const ugRef = useRef(null);
    const pgRef = useRef(null);
    const experienceRefs = useRef([]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        watch,
        formState: { errors },
        trigger,
        reset
    } = useForm({
        defaultValues: {
            resume: null,
            idProof: null,
            education: {
                tenth: { file: null, verified: false },
                twelfth: { file: null, verified: false },
                ug: { file: null, verified: false },
                pg: { file: null, verified: false },
                others: []
            },
            experience: []
        },
        mode: "onChange"
    });

    const [uploadProgress, setUploadProgress] = useState(0);
    const formValues = watch();

    const validateFile = (file, isRequired = true, fieldName = '', maxSizeMB = 5) => {
        if (isRequired && !file) return `${fieldName} is required`;
        if (!file) return true; // Not required and no file - valid

        // Check file size
        if (file.size === 0) return `${fieldName} file is empty (0 bytes)`;
        if (file.size > maxSizeMB * 1024 * 1024) return `${fieldName} file size exceeds ${maxSizeMB}MB limit`;

        // Check file extension
        const validExtensions = ['.pdf', '.doc', '.docx'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            return `${fieldName} must be PDF, DOC, or DOCX format`;
        }

        return true;
    };

    const handleFileChange = (fieldName, isRequired = true, displayName = '') => (e) => {
        const file = e.target.files[0];
        setValue(fieldName, file);
        trigger(fieldName);
    };

    const handleAddExperience = () => {
        const currentExperience = getValues("experience") || [];
        setValue("experience", [...currentExperience, { file: null, company: '' }]);
        experienceRefs.current.push(React.createRef());
    };

    const handleExperienceChange = async (index, field, value) => {
        const currentExperience = [...getValues("experience")];
        currentExperience[index][field] = value;
        setValue("experience", currentExperience);

        // Validate both company and file if either is present
        if (field === 'company' && value && !currentExperience[index].file) {
            await trigger(`experience.${index}.file`);
        } else if (field === 'file' && value && !currentExperience[index].company) {
            await trigger(`experience.${index}.company`);
        }
    };

    const removeExperience = (index) => {
        const currentExperience = [...getValues("experience")];
        currentExperience.splice(index, 1);
        setValue("experience", currentExperience);
        experienceRefs.current.splice(index, 1);
    };

    const handleClear = () => {
        // Reset form values
        reset({
            resume: null,
            idProof: null,
            education: {
                tenth: { file: null, verified: false },
                twelfth: { file: null, verified: false },
                ug: { file: null, verified: false },
                pg: { file: null, verified: false },
                others: []
            },
            experience: []
        });

        // Clear file input values
        if (resumeRef.current) resumeRef.current.value = '';
        if (idProofRef.current) idProofRef.current.value = '';
        if (tenthRef.current) tenthRef.current.value = '';
        if (twelfthRef.current) twelfthRef.current.value = '';
        if (ugRef.current) ugRef.current.value = '';
        if (pgRef.current) pgRef.current.value = '';

        // Clear experience file inputs
        experienceRefs.current.forEach(ref => {
            if (ref.current) ref.current.value = '';
        });
        experienceRefs.current = [];
    };

    const onSubmit = async (data) => {
        try {
            setUploadProgress(0);
            const totalSteps = 5 + (data.experience?.length || 0);
            let currentStep = 0;

            const uploadInterval = setInterval(() => {
                currentStep++;
                const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
                setUploadProgress(progress);

                if (currentStep >= totalSteps) {
                    clearInterval(uploadInterval);
                    toast.success('All documents uploaded successfully!');
                    navigate('/upload-success', { state: { documents: data } });
                }
            }, 500);

        } catch (error) {
            toast.error('Upload failed. Please try again.');
            setUploadProgress(0);
        }
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Document Upload</strong></h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/main" className="custom-link">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Document Upload</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Candidate Documents</h5>
                                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row">
                                        {/* Basic Documents */}
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Resume/CV <span className="text-danger">*</span>
                                            </label>
                                            <Controller
                                                name="resume"
                                                control={control}
                                                rules={{
                                                    validate: (file) => validateFile(file, true, 'Resume/CV') || true
                                                }}
                                                render={({ field }) => (
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept=".pdf,.doc,.docx"
                                                        ref={(e) => {
                                                            field.ref(e);
                                                            resumeRef.current = e;
                                                        }}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.files[0]);
                                                            trigger("resume");
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.resume && (
                                                <p className="errorMsg">{errors.resume.message}</p>
                                            )}
                                            <small className="text-muted">PDF or Word document (Max 5MB)</small>
                                        </div>
                                        <div className="col-lg-1"></div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                ID Proof <span className="text-danger">*</span>
                                            </label>
                                            <Controller
                                                name="idProof"
                                                control={control}
                                                rules={{
                                                    validate: (file) => validateFile(file, true, 'ID Proof') || true
                                                }}
                                                render={({ field }) => (
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept=".pdf,.doc,.docx"
                                                        ref={(e) => {
                                                            field.ref(e);
                                                            idProofRef.current = e;
                                                        }}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.files[0]);
                                                            trigger("idProof");
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.idProof && (
                                                <p className="errorMsg">{errors.idProof.message}</p>
                                            )}
                                            <small className="text-muted">PDF or Word document (Max 5MB)</small>
                                        </div>

                                        {/* Education Documents */}
                                        <div className="col-12 mb-4">
                                            <h6 className="text-primary">Education Certificates <span className="text-danger">*</span></h6>
                                            <div className="dropdown-divider mb-3" style={{ borderTopColor: "#d7d9dd" }} />

                                            <div className="row">
                                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                                    <label className="form-label">10th Marksheet/Certificate <span className="text-danger">*</span></label>
                                                    <Controller
                                                        name="education.tenth.file"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, true, '10th Marksheet') || true
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept=".pdf,.doc,.docx"
                                                                ref={(e) => {
                                                                    field.ref(e);
                                                                    tenthRef.current = e;
                                                                }}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.files[0]);
                                                                    trigger("education.tenth.file");
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.education?.tenth?.file && (
                                                        <p className="errorMsg">{errors.education.tenth.file.message}</p>
                                                    )}

                                                    <small className="text-muted">PDF or Word document (Max 5MB)</small>
                                                </div>
                                                <div className="col-lg-1"></div>
                                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                                    <label className="form-label">12th Marksheet/Certificate <span className="text-danger">*</span></label>
                                                    <Controller
                                                        name="education.twelfth.file"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, true, '12th Marksheet') || true
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept=".pdf,.doc,.docx"
                                                                ref={(e) => {
                                                                    field.ref(e);
                                                                    twelfthRef.current = e;
                                                                }}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.files[0]);
                                                                    trigger("education.twelfth.file");
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.education?.twelfth?.file && (
                                                        <p className="errorMsg">{errors.education.twelfth.file.message}</p>
                                                    )}
                                                    <small className="text-muted">PDF or Word document (Max 5MB)</small>
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                                    <label className="form-label">Undergraduate Degree <span className="text-danger">*</span></label>
                                                    <Controller
                                                        name="education.ug.file"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, true, 'Undergraduate Degree') || true
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept=".pdf,.doc,.docx"
                                                                ref={(e) => {
                                                                    field.ref(e);
                                                                    ugRef.current = e;
                                                                }}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.files[0]);
                                                                    trigger("education.ug.file");
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.education?.ug?.file && (
                                                        <p className="errorMsg">{errors.education.ug.file.message}</p>
                                                    )}
                                                    <small className="text-muted">PDF or Word document (Max 5MB)</small>
                                                </div>
                                                <div className="col-lg-1"></div>
                                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                                    <label className="form-label">Postgraduate Degree</label>
                                                    <Controller
                                                        name="education.pg.file"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, false, 'Postgraduate Degree') || true
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept=".pdf,.doc,.docx"
                                                                ref={(e) => {
                                                                    field.ref(e);
                                                                    pgRef.current = e;
                                                                }}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.files[0]);
                                                                    trigger("education.pg.file");
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.education?.pg?.file && (
                                                        <p className="errorMsg text-danger mt-1">{errors.education.pg.file.message}</p>
                                                    )}
                                                    <small className="text-muted">PDF or Word document (Max 5MB)</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Experience Documents */}
                                        <div className="col-12 mb-4">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="text-primary mb-0">Experience Letters</h6>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={handleAddExperience}
                                                >
                                                    + Add Experience
                                                </button>
                                            </div>
                                            <div className="dropdown-divider mb-3" style={{ borderTopColor: "#d7d9dd" }} />

                                            {(!formValues.experience || formValues.experience.length === 0) && (
                                                <div className="alert alert-info">
                                                    No experience documents added (optional)
                                                </div>
                                            )}

                                            {formValues.experience?.map((exp, index) => (
                                                <div key={index} className="row g-3 mb-3 align-items-end">
                                                    <div className="col-12 col-md-5 col-lg-4">
                                                        <label className="form-label">Company Name</label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.experience?.[index]?.company ? 'is-invalid' : ''
                                                                }`}
                                                            {...register(`experience.${index}.company`, {
                                                                validate: (value) => {
                                                                    const file = getValues(`experience.${index}.file`);
                                                                    if (file && !value?.trim()) {
                                                                        return 'Company name is required when uploading experience letter';
                                                                    }
                                                                    if (value?.trim() && !file) {
                                                                        return true; // File validation will handle the other case
                                                                    }
                                                                    return true;
                                                                }
                                                            })}
                                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                            placeholder="Company name"
                                                        />
                                                        {errors.experience?.[index]?.company && (
                                                            <p className="errorMsg text-danger mt-1">{errors.experience[index].company.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-12 col-md-5 col-lg-4">
                                                        <label className="form-label">Experience Letter</label>
                                                        <Controller
                                                            name={`experience.${index}.file`}
                                                            control={control}
                                                            rules={{
                                                                validate: (file) => {
                                                                    const company = getValues(`experience.${index}.company`);
                                                                    if (company?.trim() && !file) {
                                                                        return 'Experience letter is required when company name is provided';
                                                                    }
                                                                    return validateFile(file, false, 'Experience Letter') || true;
                                                                }
                                                            }}
                                                            render={({ field }) => (
                                                                <input
                                                                    type="file"
                                                                    className={`form-control ${errors.experience?.[index]?.file ? 'is-invalid' : ''
                                                                        }`}
                                                                    accept=".pdf,.doc,.docx"
                                                                    ref={(e) => {
                                                                        field.ref(e);
                                                                        experienceRefs.current[index] = e;
                                                                    }}
                                                                    onChange={(e) => {
                                                                        field.onChange(e.target.files[0]);
                                                                        handleExperienceChange(index, 'file', e.target.files[0]);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        {errors.experience?.[index]?.file && (
                                                            <p className="errorMsg text-danger mt-1">{errors.experience[index].file.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-12 col-md-2 col-lg-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger w-100"
                                                            onClick={() => removeExperience(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progress Bar */}
                                        {uploadProgress > 0 && (
                                            <div className="col-12 mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Upload Progress:</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="progress">
                                                    <div
                                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                                        role="progressbar"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Form Actions */}
                                        <div className="col-12 mt-4 d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary me-2"
                                                onClick={handleClear}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={uploadProgress > 0}
                                            >
                                                {uploadProgress > 0 ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Submit Documents'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default CandidateDocumentUpload;