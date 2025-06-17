import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import LayOut from '../../LayOut/LayOut';
import { Link } from 'react-router-dom';
import { 
  Upload as FiUpload, 
  X as FiX, 
  Plus as FiPlus, 
  Trash as FiTrash2, 
  File as FiFile,
  FileEarmarkPdf as FiFilePdf,
  FileEarmarkWord as FiFileWord,
  FileEarmarkImage as FiFileImage,
  ChevronDown,
  ChevronUp,
  CheckCircleFill,
  InfoCircle,
  ExclamationTriangle
} from 'react-bootstrap-icons';

const CandidateDocumentUpload = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [expandedQualification, setExpandedQualification] = useState(null);
    const [completedSections, setCompletedSections] = useState({
        basic: false,
        education: false,
        experience: false
    });

    const educationQualifications = [
        { id: 'tenth', name: '10th Marksheet', required: true, description: 'Upload your 10th standard marksheet or equivalent' },
        { id: 'twelfth', name: '12th Marksheet', required: true, description: 'Upload your 12th standard marksheet or equivalent' },
        { id: 'ug', name: 'Undergraduate Degree', required: true, description: 'Upload your bachelor\'s degree certificate' },
        { id: 'pg', name: 'Postgraduate Degree', required: false, description: 'Upload your master\'s degree certificate if applicable' },
        { id: 'others', name: 'Other Certificates', required: false, description: 'Upload any additional academic certificates' }
    ];

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        watch,
        formState: { errors, isValid, isDirty },
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

    const formValues = watch();

    useEffect(() => {
        const checkSectionCompletion = () => {
            const basicCompleted = !!formValues.resume && !!formValues.idProof;
            
            const educationCompleted = educationQualifications.every(qual => {
                if (!qual.required) return true;
                return !!formValues.education?.[qual.id]?.file;
            });
            
            const experienceCompleted = 
                !formValues.experience?.length || 
                formValues.experience.every(exp => exp.company && exp.file);
            
            setCompletedSections(prev => {
                const newState = {
                    basic: basicCompleted,
                    education: educationCompleted,
                    experience: experienceCompleted
                };
                return JSON.stringify(prev) === JSON.stringify(newState) ? prev : newState;
            });
        };

        const subscription = watch(checkSectionCompletion);
        return () => subscription.unsubscribe();
    }, [educationQualifications]);

    const validateFile = (file, isRequired = true, fieldName = '', maxSizeMB = 5) => {
        if (isRequired && !file) return `${fieldName} is required`;
        if (!file) return true;

        if (file.size === 0) return `${fieldName} file is empty (0 bytes)`;
        if (file.size > maxSizeMB * 1024 * 1024) return `${fieldName} file size exceeds ${maxSizeMB}MB limit`;

        const validExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            return `${fieldName} must be PDF, DOC, DOCX, PNG, JPG, or JPEG format`;
        }

        return true;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e, fieldName) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setValue(fieldName, file);
            trigger(fieldName);
        }
    };

    const handleFileChange = (fieldName) => (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setValue(fieldName, file);
            trigger(fieldName);
        }
    };

    const handleAddExperience = () => {
        const currentExperience = getValues("experience") || [];
        setValue("experience", [...currentExperience, { file: null, company: '' }]);
    };

    const handleExperienceChange = async (index, field, value) => {
        const currentExperience = [...getValues("experience")];
        currentExperience[index][field] = value;
        setValue("experience", currentExperience);

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
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all uploaded documents?')) {
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
            toast.info('All documents cleared');
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const FilePreview = ({ file, onRemove, fieldName, showRemove = true, thumbnail = false }) => {
        const [previewUrl, setPreviewUrl] = useState(null);
        const [showFullPreview, setShowFullPreview] = useState(false);
        const isImage = file?.type?.startsWith('image/');
        const isPDF = file?.name?.toLowerCase().endsWith('.pdf');

        useEffect(() => {
            if (file && (isImage || isPDF)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewUrl(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }, [file, isImage, isPDF]);

        if (!file) return null;

        if (thumbnail) {
            return (
                <>
                    <div 
                        className="thumbnail-preview" 
                        onClick={() => setShowFullPreview(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        {isImage && previewUrl ? (
                            <img 
                                src={previewUrl} 
                                alt="Thumbnail" 
                                className="img-thumbnail"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover"
                                }}
                            />
                        ) : (
                            <div className="file-thumbnail d-flex align-items-center justify-content-center bg-light rounded">
                                <FiFile size={24} className="text-primary" />
                            </div>
                        )}
                    </div>

                    {showFullPreview && (
                        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{file.name}</h5>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setShowFullPreview(false)}
                                            aria-label="Close"
                                        ></button>
                                    </div>
                                    <div className="modal-body text-center">
                                        {isImage ? (
                                            <img 
                                                src={previewUrl} 
                                                alt="Full Preview" 
                                                className="img-fluid"
                                                style={{ maxHeight: '70vh' }}
                                            />
                                        ) : isPDF ? (
                                            <embed 
                                                src={previewUrl} 
                                                type="application/pdf" 
                                                width="100%" 
                                                height="600px"
                                            />
                                        ) : (
                                            <div className="d-flex flex-column align-items-center justify-content-center p-5">
                                                <FiFile size={48} className="text-muted mb-3" />
                                                <p>No preview available for this file type</p>
                                                <a 
                                                    href={previewUrl} 
                                                    download={file.name}
                                                    className="btn btn-primary mt-2"
                                                >
                                                    Download File
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={() => setShowFullPreview(false)}
                                        >
                                            Close
                                        </button>
                                        <a 
                                            href={previewUrl} 
                                            download={file.name}
                                            className="btn btn-primary"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        }

        return (
            <div className="file-preview-container">
                {isImage && previewUrl ? (
                    <div className="image-preview-wrapper">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="img-thumbnail"
                            style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover"
                            }}
                        />
                        <div className="file-info-overlay">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="text-truncate" style={{ maxWidth: '120px' }}>{file.name}</span>
                                <small className="text-white">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                            </div>
                        </div>
                        {showRemove && (
                            <button 
                                type="button" 
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                                onClick={() => {
                                    setValue(fieldName, null);
                                    onRemove && onRemove();
                                }}
                                aria-label="Remove file"
                                style={{ width: '24px', height: '24px', padding: '0' }}
                            >
                                <FiX size={12} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="file-preview d-flex align-items-center bg-light rounded p-3">
                        <div className="d-flex align-items-center w-100">
                            <FiFile className="me-3 fs-4 text-primary" />
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium text-truncate me-2" style={{ maxWidth: '200px' }}>{file.name}</span>
                                    <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                </div>
                                <div className="d-flex align-items-center mt-1">
                                    <CheckCircleFill className="text-success me-1" size={12} />
                                    <small className="text-success">Uploaded</small>
                                </div>
                            </div>
                            {showRemove && (
                                <button 
                                    type="button" 
                                    className="btn btn-sm btn-link text-danger ms-2"
                                    onClick={() => {
                                        setValue(fieldName, null);
                                        onRemove && onRemove();
                                    }}
                                    aria-label="Remove file"
                                >
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const DragDropArea = ({ fieldName, label, required = false, accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg", description }) => {
        const file = getValues(fieldName);
        const fileInputRef = useRef(null);
        const isImageField = accept.includes('.png') || accept.includes('.jpg') || accept.includes('.jpeg');
        
        const handleClick = (e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
        };
        
        const handleFileChange = useCallback((e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setValue(fieldName, file);
                trigger(fieldName);
            }
        }, [fieldName, setValue, trigger]);

        return (
            <div className="row g-3 align-items-center">
                <div className="col-md-8">
                    <label className="form-label d-block fw-medium">
                        {label} {required && <span className="text-danger">*</span>}
                    </label>
                    {description && <p className="text-muted small mb-2">{description}</p>}
                    {!file ? (
                        <div 
                            className={`drag-drop-area ${dragActive ? 'drag-active' : ''} ${errors[fieldName] ? 'is-invalid' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => handleDrop(e, fieldName)}
                            onClick={handleClick}
                            style={{ cursor: 'pointer' }}
                            aria-describedby={`${fieldName}-help`}
                        >
                            <FiUpload className="upload-icon mb-2" size={24} />
                            <p className="mb-1">
                                <span className="text-primary">Click to upload</span> or drag and drop
                            </p>
                            <small className="text-muted">
                                {accept.includes('.pdf') ? 'PDF, DOC, DOCX, PNG, JPG (Max 5MB)' : 'PNG, JPG (Max 5MB)'}
                            </small>
                            <input
                                type="file"
                                className="d-none"
                                id={fieldName}
                                ref={fileInputRef}
                                accept={accept}
                                onChange={handleFileChange}
                                aria-invalid={errors[fieldName] ? "true" : "false"}
                            />
                        </div>
                    ) : (
                        <div className="text-center">
                            <input
                                type="file"
                                className="d-none"
                                id={fieldName}
                                ref={fileInputRef}
                                accept={accept}
                                onChange={handleFileChange}
                            />
                            <label 
                                htmlFor={fieldName} 
                                className="btn btn-sm btn-outline-primary me-2"
                            >
                                <FiUpload className="me-1" /> Change File
                            </label>
                            <button 
                                onClick={() => {
                                    setValue(fieldName, null);
                                    trigger(fieldName);
                                }}
                                className="btn btn-sm btn-outline-danger"
                            >
                                <FiX className="me-1" /> Remove
                            </button>
                        </div>
                    )}
                    {errors[fieldName] && (
                        <div className="invalid-feedback d-block">{errors[fieldName].message}</div>
                    )}
                </div>
                <div className="col-md-4">
                    {file && (
                        <div className="d-flex justify-content-center">
                            <FilePreview 
                                file={file} 
                                fieldName={fieldName}
                                onRemove={() => {
                                    setValue(fieldName, null);
                                    trigger(fieldName);
                                }}
                                thumbnail={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ExperienceFileUpload = ({ index }) => {
        const fileInputRef = useRef(null);
        const file = getValues(`experience.${index}.file`);
        
        const handleClick = () => {
            fileInputRef.current.click();
        };

        return (
            <div className="row g-3 align-items-center">
                <div className="col-md-6">
                    <div 
                        className="drag-drop-area small" 
                        onClick={handleClick} 
                        style={{ cursor: 'pointer' }}
                        aria-describedby={`experience-${index}-file-help`}
                    >
                        {!file ? (
                            <>
                                <FiUpload className="upload-icon mb-2" size={18} />
                                <p className="mb-1">
                                    <span className="text-primary">Click to upload</span> or drag and drop
                                </p>
                                <small className="text-muted">
                                    PDF, DOC, DOCX (Max 5MB)
                                </small>
                                <input
                                    type="file"
                                    className="d-none"
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        setValue(`experience.${index}.file`, e.target.files[0]);
                                        handleExperienceChange(index, 'file', e.target.files[0]);
                                    }}
                                    aria-invalid={errors.experience?.[index]?.file ? "true" : "false"}
                                />
                            </>
                        ) : (
                            <div className="text-center py-2">
                                <FiUpload className="upload-icon mb-1" size={18} />
                                <p className="mb-0 text-primary">Replace file</p>
                            </div>
                        )}
                    </div>
                    {errors.experience?.[index]?.file && (
                        <div className="invalid-feedback d-block">{errors.experience[index].file.message}</div>
                    )}
                </div>
                <div className="col-md-6">
                    {file && (
                        <FilePreview 
                            file={file} 
                            fieldName={`experience.${index}.file`}
                            onRemove={() => handleExperienceChange(index, 'file', null)}
                        />
                    )}
                </div>
            </div>
        );
    };

    const EducationFileUpload = ({ qualification }) => {
        const fileInputRef = useRef(null);
        const file = getValues(`education.${qualification.id}.file`);
        
        const handleClick = () => {
            fileInputRef.current.click();
        };

        return (
            <div className="row g-3 align-items-center">
                <div className="col-md-8">
                    <div 
                        className="drag-drop-area small" 
                        onClick={handleClick} 
                        style={{ cursor: 'pointer' }}
                        aria-describedby={`education-${qualification.id}-help`}
                    >
                        {!file ? (
                            <>
                                <FiUpload className="upload-icon mb-2" size={18} />
                                <p className="mb-1">
                                    <span className="text-primary">Click to upload</span> or drag and drop
                                </p>
                                <small className="text-muted">
                                    PDF, DOC, DOCX, PNG, JPG (Max 5MB)
                                </small>
                                <input
                                    type="file"
                                    className="d-none"
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    onChange={(e) => {
                                        setValue(`education.${qualification.id}.file`, e.target.files[0]);
                                        trigger(`education.${qualification.id}.file`);
                                    }}
                                    aria-invalid={errors.education?.[qualification.id]?.file ? "true" : "false"}
                                />
                            </>
                        ) : (
                            <div className="text-center py-2">
                                <FiUpload className="upload-icon mb-1" size={18} />
                                <p className="mb-0 text-primary">Replace file</p>
                            </div>
                        )}
                    </div>
                    {errors.education?.[qualification.id]?.file && (
                        <div className="invalid-feedback d-block">
                            {errors.education[qualification.id].file.message}
                        </div>
                    )}
                </div>
                <div className="col-md-4">
                    {file && (
                        <div className="d-flex justify-content-center">
                            <FilePreview 
                                file={file} 
                                fieldName={`education.${qualification.id}.file`}
                                onRemove={() => {
                                    setValue(`education.${qualification.id}.file`, null);
                                    trigger(`education.${qualification.id}.file`);
                                }}
                                thumbnail={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const toggleQualification = (id) => {
        if (expandedQualification === id) {
            setExpandedQualification(null);
        } else {
            setExpandedQualification(id);
        }
    };

    const CompletionStatus = ({ completed }) => (
        <span className={`badge rounded-pill ${completed ? 'bg-success' : 'bg-warning'} ms-2`}>
            {completed ? 'Complete' : 'Pending'}
        </span>
    );

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Upload Your Documents</strong></h1>
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
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-0">Complete Your Profile</h5>
                                        <p className="text-muted mb-0">Upload the required documents to proceed with your application</p>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted d-block">Completion Status</small>
                                        <div className="d-flex gap-2">
                                            <small className="text-nowrap">
                                                Basic <CompletionStatus completed={completedSections.basic} />
                                            </small>
                                            <small className="text-nowrap">
                                                Education <CompletionStatus completed={completedSections.education} />
                                            </small>
                                            <small className="text-nowrap">
                                                Experience <CompletionStatus completed={completedSections.experience} />
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row g-4">
                                        {/* Basic Documents Section */}
                                        <div className="col-12">
                                            <div className="section-header mb-3 d-flex align-items-center">
                                                <h6 className="fw-bold mb-0">Basic Documents</h6>
                                                {completedSections.basic && (
                                                    <CheckCircleFill className="text-success ms-2" size={16} />
                                                )}
                                            </div>
                                            <div className="alert alert-info d-flex align-items-center">
                                                <InfoCircle className="me-2" size={18} />
                                                <small>Please upload clear scans of your documents. Make sure all text is readable.</small>
                                            </div>
                                            
                                            <div className="row g-4">
                                                <div className="col-12">
                                                    <Controller
                                                        name="resume"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, true, 'Resume/CV')
                                                        }}
                                                        render={({ field }) => (
                                                            <DragDropArea 
                                                                fieldName="resume"
                                                                label="Resume/CV"
                                                                required
                                                                description="Upload your most recent resume or curriculum vitae"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                
                                                <div className="col-12">
                                                    <Controller
                                                        name="idProof"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, true, 'ID Proof')
                                                        }}
                                                        render={({ field }) => (
                                                            <DragDropArea 
                                                                fieldName="idProof"
                                                                label="ID Proof"
                                                                required
                                                                description="Upload a government-issued ID (Passport, Driver's License, Aadhar, etc.)"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Education Documents Section */}
                                        <div className="col-12">
                                            <div className="section-header mb-3 d-flex align-items-center">
                                                <h6 className="fw-bold mb-0">Education Certificates</h6>
                                                {completedSections.education && (
                                                    <CheckCircleFill className="text-success ms-2" size={16} />
                                                )}
                                            </div>
                                            
                                            <div className="alert alert-warning d-flex align-items-center">
                                                <ExclamationTriangle className="me-2" size={16} />
                                                <small>Documents marked with <span className="text-danger">*</span> are mandatory</small>
                                            </div>
                                            
                                            <div className="accordion" id="educationAccordion">
                                                {educationQualifications.map((qualification) => (
                                                    <div key={qualification.id} className="accordion-item mb-2">
                                                        <div className="accordion-header">
                                                            <button
                                                                className="accordion-button d-flex justify-content-between align-items-center"
                                                                type="button"
                                                                onClick={() => toggleQualification(qualification.id)}
                                                                aria-expanded={expandedQualification === qualification.id}
                                                            >
                                                                <span>
                                                                    {qualification.name} 
                                                                    {qualification.required && <span className="text-danger ms-1">*</span>}
                                                                    {formValues.education?.[qualification.id]?.file && (
                                                                        <CheckCircleFill className="text-success ms-2" size={14} />
                                                                    )}
                                                                </span>
                                                                {expandedQualification === qualification.id ? (
                                                                    <ChevronUp />
                                                                ) : (
                                                                    <ChevronDown />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div 
                                                            className={`accordion-collapse collapse ${expandedQualification === qualification.id ? 'show' : ''}`}
                                                        >
                                                            <div className="accordion-body p-3">
                                                                <p className="text-muted small mb-3">{qualification.description}</p>
                                                                <EducationFileUpload 
                                                                    qualification={qualification}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Experience Documents Section */}
                                        <div className="col-12">
                                            <div className="section-header mb-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <h6 className="fw-bold mb-0">Experience Certificates</h6>
                                                        {completedSections.experience && formValues.experience?.length > 0 && (
                                                            <CheckCircleFill className="text-success ms-2" size={16} />
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={handleAddExperience}
                                                        disabled={isSubmitting}
                                                    >
                                                        <FiPlus className="me-1" /> Add Experience
                                                    </button>
                                                </div>
                                                <p className="text-muted small mb-0">Add your work experience documents (optional)</p>
                                            </div>
                                            
                                            {(!formValues.experience || formValues.experience.length === 0) && (
                                                <div className="alert alert-info mb-0 d-flex align-items-center">
                                                    <InfoCircle className="me-2" size={16} />
                                                    <small>No experience documents added (optional)</small>
                                                </div>
                                            )}

                                            {formValues.experience?.map((exp, index) => (
                                                <div key={index} className="experience-item card mb-3 border-light shadow-sm">
                                                    <div className="card-body">
                                                        <div className="row g-3 align-items-end">
                                                            <div className="col-md-5">
                                                                <label className="form-label">Company Name</label>
                                                                <input
                                                                    type="text"
                                                                    className={`form-control ${errors.experience?.[index]?.company ? 'is-invalid' : ''}`}
                                                                    {...register(`experience.${index}.company`, {
                                                                        validate: (value) => {
                                                                            const file = getValues(`experience.${index}.file`);
                                                                            if (file && !value?.trim()) {
                                                                                return 'Company name is required when uploading experience letter';
                                                                            }
                                                                            if (value?.trim() && !file) {
                                                                                return true;
                                                                            }
                                                                            return true;
                                                                        }
                                                                    })}
                                                                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                                    placeholder="Company name"
                                                                    disabled={isSubmitting}
                                                                />
                                                                {errors.experience?.[index]?.company && (
                                                                    <div className="invalid-feedback">{errors.experience[index].company.message}</div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="col-md-7">
                                                                <ExperienceFileUpload index={index} />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-3 text-end">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeExperience(index)}
                                                                disabled={isSubmitting}
                                                            >
                                                                <FiTrash2 className="me-1" /> Remove Experience
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progress Bar */}
                                        {uploadProgress > 0 && (
                                            <div className="col-12">
                                                <div className="upload-progress mb-3">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="small">Uploading documents...</span>
                                                        <span className="small">{uploadProgress}%</span>
                                                    </div>
                                                    <div className="progress" style={{ height: '8px' }}>
                                                        <div
                                                            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                                            role="progressbar"
                                                            style={{ width: `${uploadProgress}%` }}
                                                            aria-valuenow={uploadProgress}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Form Actions */}
                                        <div className="col-12 mt-2">
                                            <div className="d-flex justify-content-between border-top pt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={handleClear}
                                                    disabled={isSubmitting || !isDirty}
                                                >
                                                    <FiX className="me-1" /> Clear All
                                                </button>
                                                <div className="d-flex align-items-center">
                                                    {!isValid && (
                                                        <div className="text-danger me-3 small d-flex align-items-center">
                                                            <ExclamationTriangle className="me-1" size={14} />
                                                            Please complete all required fields
                                                        </div>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary px-4"
                                                        disabled={isSubmitting || !isValid}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUpload className="me-1" /> Submit Documents
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .drag-drop-area {
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    background-color: #f8f9fa;
                }
                
                .drag-drop-area.drag-active {
                    border-color: #0d6efd;
                    background-color: rgba(13, 110, 253, 0.05);
                }
                
                .drag-drop-area.small {
                    padding: 1.5rem;
                }
                
                .drag-drop-area.is-invalid {
                    border-color: #dc3545;
                }
                
                .upload-icon {
                    color: #6c757d;
                }
                
                .drag-drop-area:hover .upload-icon {
                    color: #0d6efd;
                }
                
                .file-preview-container {
                    margin-top: 0.5rem;
                }
                
                .image-preview-wrapper {
                    position: relative;
                    display: inline-block;
                }
                
                .file-info-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.8rem;
                }
                
                .thumbnail-preview {
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                
                .thumbnail-preview:hover {
                    border-color: #0d6efd;
                    transform: scale(1.05);
                }
                
                .file-thumbnail {
                    width: 60px;
                    height: 60px;
                }
                
                .modal {
                    z-index: 1050;
                }
                
                .modal-backdrop {
                    z-index: 1040;
                }
                
                .experience-item {
                    transition: all 0.3s ease;
                }
                
                .experience-item:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                
                .section-header {
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .accordion-button:not(.collapsed) {
                    background-color: rgba(13, 110, 253, 0.05);
                    color: #0d6efd;
                }
                
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: rgba(13, 110, 253, 0.25);
                }
            `}</style>
        </LayOut>
    );
};

export default CandidateDocumentUpload;