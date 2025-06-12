import React, { useState } from 'react'; // <--- Add useState here

import 'animate.css/animate.min.css';
import './Style.css';
import './Odometer.css';
import './Swiper.min.css';
import './plugins/plugin-custom.js'
import { Link, useNavigate } from 'react-router-dom';
import { ModalTitle } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import './main.js'

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper modules (e.g., Autoplay for the continuous scroll)
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';
import {ArrowUp, ArrowUpRight, FileEarmark, FileEarmarkText, List, Telephone,} from 'react-bootstrap-icons';



const LandingPage = () => {


    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        mode: 'onChange',
        defaultValues: {
            companyName: '',
        },
    });

      const handleEmailChange = (e) => {
        // Get the current value of the input field
        const value = e.target.value;

        // Check if the value is empty
        if (value.trim() !== "") {
            return; // Allow space button
        }
        // Prevent space character entry if the value is empty
        if (e.keyCode === 32) {
            e.preventDefault();
        }
    };
    const navigate = useNavigate()
      const [showModal, setShowModal] = useState(false);
      const [companyName, setCompanyName] = useState('');
  
      const openModal = () => {
          setShowModal(true);
      };
  
      const closeModal = () => {
          setShowModal(false);
          reset();
      };
  
       const handleCompanyNameChange = (event) => {
        setCompanyName(event.target.value);
    };
    const toInputLowerCase = (e) => {
        const inputValue = e.target.value;
        let newValue = "";
        for (let i = 0; i < inputValue.length; i++) {
            const char = inputValue.charAt(i);
            if (char.match(/[a-z]/)) {
                // Only allow lowercase letters
                newValue += char;
            }
        }
        e.target.value = newValue;
    };

    const onSubmit = (data) => {
        closeModal()
        const { companyName } = data;
        localStorage.setItem('companyName', companyName)
        reset();
        navigate(`/${companyName}/login`);

    };


  // Function to open the mobile menu
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  // Function to close the mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const companyLogos = [
    { id: 1, src: 'assets/images/logo1.png', alt: 'Company Logo 1' },
    { id: 2, src: 'assets/images/logo2.png', alt: 'Company Logo 2' },
    { id: 3, src: 'assets/images/logo3.png', alt: 'Company Logo 3' },
    { id: 4, src: 'assets/images/logo2.png', alt: 'Company Logo 4' }, // Duplicate for example
    { id: 5, src: 'assets/images/logo3.png', alt: 'Company Logo 5' }, // Duplicate for example
    { id: 6, src: 'assets/images/logo1.png', alt: 'Company Logo 6' },
    { id: 7, src: 'assets/images/logo2.png', alt: 'Company Logo 7' },
    { id: 8, src: 'assets/images/logo3.png', alt: 'Company Logo 8' },
    { id: 9, src: 'assets/images/logo3.png', alt: 'Company Logo 9' },
    { id: 10, src: 'assets/images/logo2.png', alt: 'Company Logo 10' },
    { id: 11, src: 'assets/images/logo3.png', alt: 'Company Logo 11' },
    { id: 12, src: 'assets/images/logo1.png', alt: 'Company Logo 12' },
  ];

  return (
    <>
      <header className="">
      <div className="top-0 left-0 right-0 z-50 header headerAbsolute 2">
        <div className="flex justify-between items-center container text-s1 py-4">
          <div className="pb-1 flex justify-start items-center gap-3">
            {/* Mobile Menu Open Button */}
            <button
              className="lg:hidden text-3xl mobileMenuOpenButton"
              onClick={openMobileMenu} // Attach onClick handler
            >
              <List
                className="text-3xl"
                weight="regular"
              />
            </button>
            <a href="#">
              <img src="assets/images/logo.png" alt="cub Hrm logo" />
            </a>
          </div>
          {/* Desktop Navigation */}
          <nav className="max-lg:hidden">
            <ul className="flex justify-center items-center gap-3">
              <li>
                <a
                  href="#"
                  className="menu hover:header_menu_shadow duration-700 px-2 py-3 rounded-lg"
                >Home</a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:header_menu_shadow duration-700 px-2 py-3 rounded-lg menu"
                >About</a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:header_menu_shadow duration-700 px-2 py-3 rounded-lg menu"
                >Contact Us</a>
              </li>
               <li>
               <Link to={'/anonymouseCmpRegistration'}>
                <a
                  href="#"
                  className="hover:header_menu_shadow duration-700 px-2 py-3 rounded-lg menu"
                >Sign Up</a>
                </Link>
              </li>
            </ul>
          </nav>

          <div
            className="flex justify-end items-center gap-2 sm:gap-6 xl:gap-10 font-medium max-sm:hidden"
          >
            <div className="flex justify-between items-center gap-1">
              {/* Assuming PhoneCall is imported at the top of LandingPage or this component */}
              <Telephone
                className="bg-s1 rounded-full text-s2 p-2 md:p-3 text-lg lg:text-5xl !leading-none"
                weight="regular" style={{maxHeight:"35px"}}
              />
              <a href="tel:+123456789" className="max-xl:hidden" > +91 9705678967 </a>
            </div>
            <a
              href="#"
              className="flex justify-center max-sm:text-sm items-center gap-3 py-2 md:py-3 px-3 md:px-6 rounded-full bg-s2 border border-mainTextColor text-mainTextColor group font-medium"
            onClick={openModal}>
              Company Login
              <ArrowUpRight
                className="group-hover:rotate-[45deg] duration-500 text-base sm:text-xl lg:text-2xl"
                weight="bold"
              />
            </a>
             {showModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between w-100">
                                <ModalTitle className="modal-title">Company Service Name</ModalTitle>
                                <button
                                    type="button"
                                    className="btn-close" // Bootstrap's close button class
                                    aria-label="Close"
                                    onClick={closeModal} // Function to close the modal
                                >
                               X </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <input
                                        type="text"
                                        name="companyName"
                                        className="form-control"
                                        onChange={handleCompanyNameChange}
                                        placeholder="Enter Company Service Name"
                                        onInput={toInputLowerCase}
                                        onKeyDown={handleEmailChange}
                                        {...register("companyName", {
                                            required: "Company Service Name is Required",
                                            pattern: {
                                                value: /^[a-z]+$/,
                                                message: "This field accepts only lowercase alphabetic characters without spaces",
                                            },
                                            minLength: {
                                                value: 2,
                                                message: "Minimum 2 Characters Required",
                                            },
                                            maxLength: {
                                                value: 30,
                                                message: "Maximum 30 Characters allowed",
                                            },
                                        })}
                                    />
                                    {errors.companyName && (
                                        <p className='errorMsg'>{errors.companyName.message}</p>
                                    )}
                                    <div className="modal-footer" style={{ paddingRight: "0px" }}>
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                        <button type="submit" className="btn btn-primary">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
          </div>
        </div>
      </div>

      {/* Mobile Menu Background Overlay */}
      <div
        className={`fixed top-0 left-0 bg-s1/80 h-full w-full lg:hidden duration-700 z-[998] mobileMenuBg ${
          isMobileMenuOpen ? 'mobileMenuBgOpen' : 'mobileMenuBgClose'
        }`}
        onClick={closeMobileMenu} // Click background to close
      ></div>

      {/* Mobile Menu / Sidebar */}
      <div
        className={`flex justify-start flex-col items-start gap-8 pb-10 lg:gap-20 fixed lg:hidden top-0 left-0 w-3/4 min-[500px]:w-1/2 h-full bg-s2 overflow-y-auto duration-700 z-[999] mobileMenu ${
          isMobileMenuOpen ? 'mobileMenuOpen' : 'mobileMenuClose'
        }`}
      >
        <div className="flex justify-between items-center w-full p-4 sm:p-8">
          <a href="#">
            <img src="assets/images/logo.png" alt="logo" />
          </a>
          {/* Mobile Menu Close Button */}
          <button
            className="!text-3xl cursor-pointer mobileMenuCloseButton"
            onClick={closeMobileMenu} // Attach onClick handler
          >
            <span className="text-3xl" weight="regular">X</span> {/* Assuming 'ph ph-x' is Phosphor X icon */}
          </button>
        </div>

        <ul
          className="text-lg sm:text-xl flex gap-6 lg:gap-10 items-start flex-col pl-8"
          onClick={closeMobileMenu} // Optional: Close menu when a link is clicked
        >
          <li>
            <a href="#" className="menu-hover hover:after:border-p1">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="menu-hover hover:after:border-p1">
              About
            </a>
          </li>
          <li>
            <a href="#" className="menu-hover hover:after:border-p1">
              Contact Us
            </a>
          </li>
            <li>
                <a
                  href="#"
                  className="hover:header_menu_shadow duration-700 px-2 py-3 rounded-lg menu"
                >Sign Up</a>
              </li>
        </ul>
      </div>
    </header>


      <section className="bg-repeat stp-30 hero_bg_gradient overflow-hidden">
        <img
          src="assets/images/hero_bg_element1.png"
          alt="element"
          className="absolute top-0 left-0 xxxl:left-36 max-lg:w-[300px] max-xxl:w-[500px] max-md:hidden"
        />
        <img
          src="assets/images/hero_bg_element2.png"
          alt="element"
          className="absolute top-0 right-0 max-xxl:w-[300px] max-sm:hidden"
        />
        <div className="absolute -left-[200px] -bottom-1/2 bg-white blur-[200px] rounded-[1176px] max-w-full lg:w-[1176px] h-[1176px] overflow-hidden"></div>
        <div className="xxl:ml-[calc((100%-1296px)/2)] lg:max-xxl:py-10 max-xxl:container relative z-20 max-lg:pt-15 text-s1 grid grid-cols-12">
          <img
            src="assets/images/hero_bg_element3.png"
            alt="element"
            className="absolute top-1/3 left-1/3 max-sm:hidden"
          />
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center gap-2">
            <p className="uppercase text-base lg:text-xl font-semibold animate__animated animate__fadeInUp">
              Efficiency HRM and workforce mastery
            </p>
            <div className="display-2">
              We Make <span className="text-s3 inline-flex">HRM</span>
              <br />
              Painless.
            </div>
            <p className="max-w-[550px]">
              We get your employees paid while providing online access to paystubs, tax reports & HRM tax filings.
            </p>
            <div className="flex justify-start items-center gap-4 pt-6 lg:pt-8 pb-15">
              <a
                href="#"
                className="font-medium bg-s2 py-2 lg:py-3 px-4 lg:px-6 rounded-full text-mainTextColor"
              >
                Get Started
              </a>
              <a href="#" class="underline font-medium">
                Learn More
              </a>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <img src="assets/images/hero_illus.png" alt="illustration" />
          </div>
        </div>
      </section>

       <section className="stp-15 sbp-15 container grid grid-cols-12 gap-6 border-b border-strokeColor">
      <div className="col-span-12 sm:col-span-6 xl:col-span-4">
        <p className="text-xl lg:text-2xl text-bodyText relative after:absolute after:top-[55%] after:right-0 after:w-[50px] after:h-[2px] after:bg-bodyText max-xxl:after:content-none">
          <span className="font-bold text-mainTextColor">15,000+</span>
          businesses from small startups to household names
        </p>
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-8 flex pt-4">
        <Swiper
          // Pass the modules you need. Autoplay is from your original config.
          modules={[Autoplay]}
          loop={true}
          speed={6000}
          autoplay={{
            delay: 1,
            disableOnInteraction: true,
            reverseDirection: true, // As per your main.js
          }}
          spaceBetween={24}
          slidesPerView={1} // Base setting, will be overridden by breakpoints
          centeredSlides={true}
          // The "clickable" prop is often related to pagination/navigation,
          // which you don't have for this carousel directly.
          // If you mean slides should be clickable, that's handled by your <a> tag.
          // clickable={true}

          // Apply your original breakpoints here
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 10 },
            480: { slidesPerView: 3, spaceBetween: 20, centeredSlides: false },
            576: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
            768: { slidesPerView: 2, spaceBetween: 24, centeredSlides: true },
            992: { slidesPerView: 3, spaceBetween: 24, centeredSlides: true },
            1200: { slidesPerView: 4, spaceBetween: 24, centeredSlides: true },
          }}
          // Add the original class names to the Swiper component
          className="company-images-carousel sponsors"
        >
          {companyLogos.map((logo) => (
            <SwiperSlide key={logo.id}>
              <a href="#" className="flex justify-center items-center">
                <img src={logo.src} alt={logo.alt} />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
    <section className="stp-30 sbp-30 relative">
      <img
        src="assets/images/circleIcon.png"
        alt="circle icon"
        className="absolute top-10 left-0 max-xxl:hidden xxl:-left-72 xxxl:-left-40"
      />
      <img
        src="assets/images/sliceIcon.png"
        alt="slice icon"
        className="absolute right-0 sm:right-2 lg:right-10 top-10 xl:top-32 max-md:h-[80px]"
      />
      <div className="container z-10 relative">
        <div className="flex justify-center items-center">
          <div className="flex justify-center items-center max-xxl:overflow-hidden">
            <div
              className="max-w-[700px] text-center flex justify-center items-center flex-col"
            >
              <p
                className="bg-p1 py-2 sm:py-3 px-5 rounded-full text-white wow animate__animated animate__fadeInUp"
              >
                Solutions
              </p>

              <h1
                className="display-4 pt-4 pb-4 lg:pb-6 wow animate__animated animate__fadeInDown"
              >
                The CUB  HRM solution
              </h1>

              <p
                className="text-bodyText wow animate__animated animate__fadeInDown"
              >
                When it comes to HRM solutions, we have a variety of options
                that benefit both your company and your contractor.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 stp-15 max-lg:gap-6">
          <div className="col-span-12 lg:col-span-6">
            <div
              className="flex justify-center items-center overflow-hidden self-stretch"
            >
              <img
                src="assets/images/solution_illustrations.png"
                alt="image"
                className="hover:scale-110 duration-500 w-full"
              />
            </div>
          </div>
          <div
            className="col-span-12 lg:col-start-8 lg:col-span-5 flex justify-center items-start flex-col"
          >
            <h1 className="heading-1 pb-5">Consolidate HRM Processing</h1>
            <p className="text-bodyText">
              We have designed a fast and effective HRM system that
              streamlines your payment process.
            </p>
            <div className="grid grid-cols-2 gap-4 lg:gap-6 py-6 lg:py-10 w-full">
              <div
                className="group col-span-2 sm:col-span-1 flex justify-start items-center gap-5"
              >
                <i
                 className="rounded-full border border-strokeColor bg-softBg w-[40px] h-[40px] sm:w-[80px] sm:h-[80px] text-4xl text-s1 group-hover:text-mainTextColor group-hover:bg-s2 group-hover:border-mainTextColor duration-500 !leading-[0] flex justify-center items-center">
                 <FileEarmarkText size={40}/>
                 </i>
                <p className="text-lg font-medium group-hover:text-s1 duration-500">
                  Tax Preparation
                </p>
              </div>
              <div
                className="group col-span-2 sm:col-span-1 flex justify-start items-center gap-5"
              >
                <i
                  className="ph-fill ph-hand-heart rounded-full border border-strokeColor bg-softBg w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] text-4xl text-s1 group-hover:text-mainTextColor group-hover:bg-s2 group-hover:border-mainTextColor duration-500 !leading-[0] flex justify-center items-center"
                ></i>
                <p className="text-lg font-medium group-hover:text-s1 duration-500">
                  HRM Processing
                </p>
              </div>
              <div
                className="group col-span-2 sm:col-span-1 flex justify-start items-center gap-5"
              >
                <i
                  className="ph-fill ph-lightbulb-filament rounded-full border border-strokeColor bg-softBg w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] text-4xl text-s1 group-hover:text-mainTextColor group-hover:bg-s2 group-hover:border-mainTextColor duration-500 !leading-[0] flex justify-center items-center"
                ></i>
                <p className="text-lg font-medium group-hover:text-s1 duration-500">
                  Cost Effective
                </p>
              </div>
              <div
                className="group col-span-2 sm:col-span-1 flex justify-start items-center gap-5"
              >
                <i
                  className="ph-fill ph-rocket-launch rounded-full border border-strokeColor bg-softBg w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] text-4xl text-s1 group-hover:text-mainTextColor group-hover:bg-s2 group-hover:border-mainTextColor duration-500 !leading-[0] flex justify-center items-center"
                ></i>
                <p className="text-lg font-medium group-hover:text-s1 duration-500">
                  Scale Rapidly
                </p>
              </div>
            </div>
            <div className="flex justify-start items-start">
              <a
                href="#"
                className="flex justify-center max-sm:text-sm items-center gap-3 py-2 md:py-3 px-3 md:px-6 rounded-full bg-s2 border border-mainTextColor text-mainTextColor group font-medium"
              >
                Contact Us
                <span
                  className="group-hover:rotate-[45deg] duration-500 text-base sm:text-xl lg:text-2xl !leading-[0]"
                >
                  <i className="ph-bold ph-arrow-up-right"></i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
     <section className="bg-softBg1 stp-30 sbp-30">
      <div className="container">
        <div
          className="flex justify-between items-end gap-6 max-lg:flex-col max-lg:items-start"
        >
          <div className="max-w-[600px] flex justify-center items-start flex-col">
            <p
              className="bg-p1 py-3 px-5 rounded-full text-white wow animate__animated animate__fadeInUp"
            >
              Features
            </p>
            <h1
              className="display-4 pt-4 wow animate__animated animate__fadeInDown"
            >
              Perfect solutions for your business
            </h1>
          </div>
          <p className="text-bodyText max-w-[500px]">
            We’re simplifying every aspect of managing a world-wide team, from
            benefits and equity to working visas and equipment. It’s one
            platform made to get you set up.
          </p>
        </div>
        <div className="grid grid-cols-12 gap-6 stp-15">
          <div
            className="col-span-12 sm:col-span-6 lg:col-span-3 wow animate__animated animate__fadeInUp"
            data-wow-duration="1.3s"
          >
            <div
              className="bg-white p-2 xl:p-8 flex flex-col border border-white group hover:border-mainTextColor duration-700 hover:bg-s2"
            >
              <div
                className="text-4xl text-center text-s1 pb-5 mt-3 group-hover:text-mainTextColor duration-500"
              >
                <i className="ph-fill ph-users-three"></i>
              </div>
              <h4 className="heading-4 pb-5">EOR employees</h4>
              <p className="text-bodyText pb-6">
                Easily hire and pay employees where you don’t have entities with
                Jonny’s world-wide infrastructure.
              </p>
              <a
                href="#"
                className="flex justify-start items-center gap-2 font-medium"
              >
                Learn more <i className="ph ph-arrow-right"></i>
              </a>
            </div>
          </div>
          <div
            className="col-span-12 sm:col-span-6 lg:col-span-3 wow animate__animated animate__fadeInUp"
            data-wow-duration="1.3s"
            data-wow-delay=".2s"
          >
            <div
              className="bg-white p-2 xl:p-8 flex flex-col border border-white group hover:border-mainTextColor duration-700 hover:bg-s2"
            >
              <div
                className="text-4xl text-center mt-3 text-s1 pb-5 group-hover:text-mainTextColor duration-500"
              >
                <i className="ph-fill ph-hand-coins"></i>
              </div>
              <h4 className="heading-4 pb-5">CUB HRM</h4>
              <p className="text-bodyText pb-6">
                Streamline your  HRM with precision and compliance.
                Our expert services ensure accurate and timely.
              </p>
              <a
                href="#"
                className="flex justify-start items-center gap-2 font-medium"
              >
                Learn more <i className="ph ph-arrow-right"></i>
              </a>
            </div>
          </div>
          <div
            className="col-span-12 sm:col-span-6 lg:col-span-3 wow animate__animated animate__fadeInUp"
            data-wow-duration="1.3s"
            data-wow-delay=".4s"
          >
            <div
              className="bg-white p-2 xl:p-8 flex flex-col border border-white group hover:border-mainTextColor duration-700 hover:bg-s2"
            >
              <div
                className="text-4xl text-center mt-3 text-s1 pb-5 group-hover:text-mainTextColor duration-500"
              >
                <i className="ph-fill ph-user-gear"></i>
              </div>
              <h4 className="heading-4 pb-5">Contractors</h4>
              <p className="text-bodyText pb-6">
                Reliable contractors delivering quality craftsmanship and
                exceptional service. Your perfect project,
              </p>
              <a
                href="#"
                className="flex justify-start items-center gap-2 font-medium"
              >
                Learn more <i className="ph ph-arrow-right"></i>
              </a>
            </div>
          </div>
          <div
            className="col-span-12 sm:col-span-6 lg:col-span-3 wow animate__animated animate__fadeInUp"
            data-wow-duration="1.3s"
            data-wow-delay=".6s"
          >
            <div
              className="bg-white p-2 xl:p-8 flex flex-col border border-white group hover:border-mainTextColor duration-700 hover:bg-s2"
            >
              <div
                className="text-4xl text-center mt-3 text-s1 pb-5 group-hover:text-mainTextColor duration-500"
              >
                <i className="ph-fill ph-user-plus"></i>
              </div>
              <h4 className="heading-4 pb-5">Direct employees</h4>
              <p className="text-bodyText pb-6">
                Maximize workforce efficiency with our Direct Employees
                services. Streamline hiring, HRM,
              </p>
              <a
                href="#"
                className="flex justify-start items-center gap-2 font-medium"
              >
                Learn more <i className="ph ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
     style={{ backgroundImage: "url('assets/images/counter_bg.png')" }}
      className="bg-cover stp-30 sbp-30 relative"
    >
      <div
        className="container text-white flex justify-between items-center gap-8 sm:gap-4 md:gap-8 lg:gap-16 max-sm:flex-col"
      >
        <div className="text-center max-w-[280px]">
          <p className="display-4 pb-3 flex justify-center items-center">
            <span className="odometer" data-odometer-final="63">0</span>
            <span>hrs</span>
          </p>
          <p>
            Average time saved per month running HRM and HR after switching
            to Cub Hrm.
          </p>
        </div>
        <div className="h-[120px] w-[2px] bg-white/70 mt-8 max-sm:hidden"></div>
        <div className="text-center max-w-[280px]">
          <p className="display-4 pb-3 counters flex justify-center items-center">
            <span>$</span
            ><span className="odometer" data-odometer-final="264589">0</span>
          </p>
          <p>
            Average savings made per year running HRM and HR after switching
            to Cub Hrm.
          </p>
        </div>
        <div className="h-[120px] w-[2px] bg-white/70 mt-8 max-sm:hidden"></div>
        <div className="text-center max-w-[280px]">
          <p className="display-4 pb-3 counters flex justify-center items-center">
            <span className="odometer" data-odometer-final="8">0</span
            ><span>Weeks</span>
          </p>
          <p>average time it takes to switch to Cub Hrm - and often less</p>
        </div>
      </div>
    </section>

     <section className="stp-30 sbp-30">
  <div className="container">
    <div className="flex justify-center items-center">
      <div className="flex justify-center items-center max-xxl:overflow-hidden">
        <div
          className="max-w-[700px] text-center flex justify-center items-center flex-col"
        >
          <p
            className="bg-p1 py-2 sm:py-3 px-5 rounded-full text-white wow animate__animated animate__fadeInUp"
          >
            How it works
          </p>

          <h1
            className="display-4 pt-4 pb-4 lg:pb-6 wow animate__animated animate__fadeInDown"
          >
            A Step-by-Step Guide to Our Platform
          </h1>

          <p className="text-bodyText wow animate__animated animate__fadeInUp">
            Explore our platform with ease! Sign up, select your industry, and
            seamlessly integrate our tailored payment solutions.
          </p>
        </div>
      </div>
    </div>

    <div
      className="flex justify-between items-center gap-6 md:gap-4 lg:gap-6 stp-15 relative max-md:flex-col"
    >
      <img
        src="assets/images/stepArrow1.png"
        alt="image"
        className="absolute top-28 right-[22%] max-xxl:right-[23%] max-xxl:top-24 max-xxl:w-[200px] max-lg:right-[25%] max-lg:w-[100px] max-md:hidden"
      />
      <img
        src="assets/images/stepArrow2.png"
        alt="image"
        className="absolute top-16 left-[21%] max-xxl:top-20 max-xxl:left-[23%] max-xxl:w-[200px] max-lg:left-[25%] max-lg:w-[100px] max-md:hidden"
      />

      <div
        className="flex justify-center items-center text-center flex-col max-w-[350px]"
      >
        <div
          className="text-s1 bg-softBg border border-strokeColor rounded-full p-6 lg:p-7 text-3xl lg:text-5xl"
        >
          <i className="ph-fill ph-file-plus"></i>
        </div>
        <h4 className="heading-4 pt-8 pb-6">Create An Account</h4>
        <p className="text-bodyText">
          Join our platform effortlessly! Streamlined user registration with
          secure verification.
        </p>
      </div>
      <div
        className="flex justify-center items-center text-center flex-col max-w-[350px]"
      >
        <div
          className="text-s1 bg-softBg border border-strokeColor rounded-full p-6 lg:p-7 text-3xl lg:text-5xl"
        >
          <i className="ph-fill ph-user"></i>
        </div>
        <h4 className="heading-4 pt-8 pb-6">Add Your Employees</h4>
        <p className="text-bodyText">
          Join our platform effortlessly! Streamlined user registration with
          secure verification.
        </p>
      </div>
      <div
        className="flex justify-center items-center text-center flex-col max-w-[350px]"
      >
        <div
          className="text-s1 bg-softBg border border-strokeColor rounded-full p-6 lg:p-7 text-3xl lg:text-5xl"
        >
          <i className="ph-fill ph-hand-coins"></i>
        </div>
        <h4 className="heading-4 pt-8 pb-6">Run Your First HRM</h4>
        <p className="text-bodyText">
          Join our platform effortlessly! Streamlined user registration with
          secure verification.
        </p>
      </div>
    </div>
  </div>
</section>
    <section className="bg-softBg1 stp-30 sbp-30 overflow-hidden">
  <div className="container">
    <div
      className="flex justify-between items-end gap-6 max-lg:flex-col max-lg:items-start"
    >
      <div className="max-w-[600px] flex justify-center items-start flex-col">
        <p className="bg-p1 py-3 px-5 rounded-full text-white">Why Cub Hrm</p>
        <h1 className="display-4 pt-4">A platform for your Complete team</h1>
      </div>
      <p className="text-bodyText max-w-[500px]">
        Your dependable guide to achieving freedom from manual HR work and
        building that perfect workplace you have always aspired to build. Your
        dependable guide to achieving freedom.
      </p>
    </div>
    <div className="grid grid-cols-12 gap-6 stp-15">
      <div
        className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 xl:py-10 xl:px-15 flex flex-col items-center border border-white group hover:border-mainTextColor duration-700 hover:bg-s2 wow animate__animated animate__fadeInUp"
      >
        <div className="">
          <img src="assets/images/whyAccoupayCard_1.png" alt="image" />
        </div>
        <h4 className="pt-8 heading-4">
          Hire or relocate team member with in house visa support
        </h4>
      </div>
      <div
        className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 xl:py-10 xl:px-15 flex flex-col items-center border border-white group hover:border-mainTextColor duration-700 hover:bg-s2 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".2s"
      >
        <div className="">
          <img src="assets/images/whyAccoupayCard_2.png" alt="image" />
        </div>
        <h4 className="pt-8 heading-4">
          Create complaint contracts with a single click
        </h4>
      </div>
      <div
        className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 xl:py-10 xl:px-15 flex flex-col items-center border border-white group hover:border-mainTextColor duration-700 hover:bg-s2 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".4s"
      >
        <div className="">
          <img src="assets/images/whyAccoupayCard_3.png" alt="image" />
        </div>
        <h4 className="pt-8 heading-4">
          Send equipment worldwide, without the hassle
        </h4>
      </div>
      <div
        className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 xl:py-10 xl:px-15 flex flex-col items-center border border-white group hover:border-mainTextColor duration-700 hover:bg-s2 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".6s"
      >
        <div className="">
          <img src="assets/images/whyAccoupayCard_4.png" alt="image" />
        </div>
        <h4 className="pt-8 heading-4">
          Offer country- specific benefits at competitive rates
        </h4>
      </div>
      <div
        className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 xl:py-10 xl:px-15 flex flex-col items-center border border-white group hover:border-mainTextColor duration-700 hover:bg-s2 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".8s"
      >
        <div className="">
          <img src="assets/images/whyAccoupayCard_5.png" alt="image" />
        </div>
        <h4 className="pt-8 heading-4">
          Provide your team with co-working access via work
        </h4>
      </div>
      <div
        className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white p-6 xl:py-10 xl:px-15 flex flex-col items-center border border-white group hover:border-mainTextColor duration-700 hover:bg-s2 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay="1s"
      >
        <div className="">
          <img src="assets/images/whyAccoupayCard_6.png" alt="image" />
        </div>
        <h4 className="pt-8 heading-4">Save time using advance integrations</h4>
      </div>
    </div>
  </div>
</section>

<section className="stp-30 sbp-30">
      <div className="container grid grid-cols-12">
        <div
          className="flex justify-start items-start col-span-12 lg:col-span-5 max-lg:sbp-15"
        >
          <div className="max-w-[600px] flex justify-start items-start flex-col">
            <p
              className="bg-p1 py-3 px-5 rounded-full text-white wow animate__animated animate__fadeInUp"
            >
              Integrations
            </p>
            <h1
              className="display-4 pt-4 pb-6 wow animate__animated animate__fadeInDown"
            >
              All in One Place All in Sync.
            </h1>
            <p className="text-bodyText wow animate__animated animate__fadeInUp">
              Experience seamless coordination with our comprehensive services.
              From accounting to HRM, we bring everything together in one
              place,
            </p>
          </div>
        </div>

        <div
          className="col-span-12 min-[500px]:col-span-6 lg:col-span-3 lg:col-start-7 hover:bg-s2 border hover:border-mainTextColor duration-500 min-h-[250px] lg:min-h-[300px] flex justify-start items-start flex-col p-8 bg-softBg1 border-softBg1"
        >
          <div className="text-4xl rounded-full text-s1 leading-[0] p-4 bg-white">
            <i className="ph-fill ph-currency-circle-dollar"></i>
          </div>
          <h4 className="heading-4 pt-6 w-[200px]">Payment Gateways</h4>
          <div
            className="flex justify-end items-end w-full pt-10 lg:pt-15 text-xl font-medium"
          >
            <a
              href="all-services.html"
              className="bg-white p-2 rounded-full shadow2 leading-[0]"
            >
              <i className="ph ph-arrow-right"></i>
            </a>
          </div>
        </div>
        <div
          className="col-span-12 min-[500px]:col-span-6 lg:col-span-3 hover:bg-s2 border hover:border-mainTextColor duration-500 min-h-[250px] lg:min-h-[300px] flex justify-start items-start flex-col p-8 border-white"
        >
          <div className="text-4xl rounded-full text-s1 leading-[0] p-4 bg-softBg1">
            <i className="ph-fill ph-money"></i>
          </div>
          <h4 className="heading-4 pt-6 w-[200px]">Tax Software Integration</h4>
          <div
            className="flex justify-end items-end w-full pt-10 lg:pt-15 text-xl font-medium"
          >
            <a
              href="all-services.html"
              className="bg-white p-2 rounded-full shadow2 leading-[0]"
            >
              <i className="ph ph-arrow-right"></i>
            </a>
          </div>
        </div>
        <div
          className="col-span-12 min-[500px]:col-span-6 lg:col-span-3 lg:col-start-4 min-[500px]:max-lg:order-2 hover:bg-s2 border hover:border-mainTextColor duration-500 min-h-[250px] lg:min-h-[300px] flex justify-start items-start flex-col p-8 bg-softBg1 border-softBg1"
        >
          <div className="text-4xl rounded-full text-s1 leading-[0] p-4 bg-white">
            <i className="ph-fill ph-users-three"></i>
          </div>
          <h4 className="heading-4 pt-6 w-[200px]">Expense Management</h4>
          <div
            className="flex justify-end items-end w-full pt-10 lg:pt-15 text-xl font-medium"
          >
            <a
              href="all-services.html"
              className="bg-white p-2 rounded-full shadow2 leading-[0]"
            >
              <i className="ph ph-arrow-right"></i>
            </a>
          </div>
        </div>
        <div
          className="col-span-12 min-[500px]:col-span-6 lg:col-span-3 hover:bg-s2 border hover:border-mainTextColor duration-500 min-h-[250px] lg:min-h-[300px] flex justify-start items-start flex-col p-8 border-white"
        >
          <div className="text-4xl rounded-full text-s1 leading-[0] p-4 bg-softBg1">
            <i className="ph-fill ph-timer"></i>
          </div>
          <h4 className="heading-4 pt-6 w-[200px]">Time Tracking Systems</h4>
          <div
            className="flex justify-end items-end w-full pt-10 lg:pt-15 text-xl font-medium"
          >
            <a
              href="all-services.html"
              className="bg-white p-2 rounded-full shadow2 leading-[0]"
            >
              <i className="ph ph-arrow-right"></i>
            </a>
          </div>
        </div>
        <div
          className="col-span-12 min-[500px]:col-span-6 lg:col-span-3 hover:bg-s2 border hover:border-mainTextColor duration-500 min-h-[250px] lg:min-h-[300px] flex justify-start items-start flex-col p-8 bg-softBg1 border-softBg1"
        >
          <div className="text-4xl rounded-full text-s1 leading-[0] p-4 bg-white">
            <i className="ph-fill ph-handshake"></i>
          </div>
          <h4 className="heading-4 pt-6 w-[200px]">Customer Relationship</h4>
          <div
            className="flex justify-end items-end w-full pt-10 lg:pt-15 text-xl font-medium"
          >
            <a
              href="all-services.html"
              className="bg-white p-2 rounded-full shadow2 leading-[0]"
            >
              <i className="ph ph-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

     <div className="bg-p1 pt-15 overflow-hidden">
      <div
        className="max-xxl:container xxl:ml-[calc((100%-1296px)/2)] flex justify-between text-white sm:max-xxl:gap-6 max-lg:flex-col"
      >
        <div
          className="flex flex-col justify-center items-start w-full lg:max-xxl:w-1/2 xxl:max-w-[550px] max-xxl:pb-8 max-xxl:overflow-hidden"
        >
          <p
            className="text-lg font-medium underline wow animate__animated animate__fadeInUp"
          >
            Experience Cub Hrm
          </p>

          <h1
            className="display-4 pb-6 pt-4 wow animate__animated animate__fadeInDown"
          >
            We’ve got everything you need?
          </h1>

          <p className="pb-8 wow animate__animated animate__fadeInUp">
          We're here to help you streamline your HR and payroll processes. Reach out to our team for more information about CUB HRM and how it can benefit your organization
          </p>

          <a
            href="#"
            className="flex justify-center max-sm:text-sm items-center gap-3 py-2 md:py-3 px-3 md:px-6 rounded-full bg-s2 border border-mainTextColor text-mainTextColor group font-medium"
          >
            Contact Us
            <span
              className="group-hover:rotate-[45deg] duration-500 text-base sm:text-xl lg:text-2xl"
            >
              <i className="ph-bold ph-arrow-up-right"></i>
            </span>
          </a>
        </div>
        <div
          className="w-full lg:max-xxl:w-1/2 self-stretch flex justify-center max-xxl:items-center lg:pt-10 wow animate__animated animate__fadeInUp"
        >
          <img
            src="assets/images/contact_illus.png"
            alt="image"
            className="object-cover"
          />
        </div>
      </div>
    </div>


    <section className="sbp-30 overflow-hidden">
  <div className="container">
    <div className="flex justify-center items-center">
      <div className="flex justify-center items-center max-xxl:overflow-hidden">
        <div
          className="max-w-[700px] text-center flex justify-center items-center flex-col"
        >
          <p
            className="bg-p1 py-2 sm:py-3 px-5 rounded-full text-white wow animate__animated animate__zoomIn"
          >
            Contact
          </p>

          <h1
            className="display-4 pt-4 pb-4 lg:pb-6 wow animate__animated animate__fadeInUp"
          >
            Questions? Meet Answer
          </h1>

          <p className="text-bodyText wow animate__animated animate__fadeInDown">
            Startups thrive with Cub Hrm. Their flexible HRM solutions have
            been instrumental in our journey, providing the support
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-12 gap-6 stp-15">
      <div
        className="col-span-12 min-[450px]:col-span-6 md:col-span-3 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
      >
        <div className="flex justify-center items-center flex-col">
          <div className="text-7xl text-s1">
            <i className="ph-fill ph-binoculars"></i>
          </div>
          <h4 className="heading-4 pb-4 pt-3">Compare Cub Hrm</h4>
          <p className="pb-5 text-center">
            Explore how Cub Hrm stands out. Check our comparison.
          </p>
          <a href="#" className="text-s1 underline font-medium">
            Compare Cub Hrm
          </a>
        </div>
      </div>
      <div
        className="col-span-12 min-[450px]:col-span-6 md:col-span-3 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".2s"
      >
        <div className="flex justify-center items-center flex-col">
          <div className="text-7xl text-s1">
            <i className="ph-fill ph-desktop"></i>
          </div>
          <h4 className="heading-4 pb-4 pt-3">Explore The Demo</h4>
          <p className="pb-5 text-center">
            Curious about our services? Request a demo to experience firsthand
          </p>
          <a href="#" className="text-s1 underline font-medium">
            See Demo
          </a>
        </div>
      </div>
      <div
        className="col-span-12 min-[450px]:col-span-6 md:col-span-3 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".4s"
      >
        <div className="flex justify-center items-center flex-col">
          <div className="text-7xl text-s1">
            <i className="ph-fill ph-headphones"></i>
          </div>
          <h4 className="heading-4 pb-4 pt-3">Give Us a Ring</h4>
          <p className="pb-5 text-center">
            Monday through Friday from 6AM - 6PM MST
          </p>
          <a href="#" className="text-s1 underline font-medium">
            Contact
          </a>
        </div>
      </div>
      <div
        className="col-span-12 min-[450px]:col-span-6 md:col-span-3 wow animate__animated animate__fadeInUp"
        data-wow-duration="1.3s"
        data-wow-delay=".6s"
      >
        <div className="flex justify-center items-center flex-col">
          <div className="text-7xl text-s1">
            <i className="ph-fill ph-chat-centered"></i>
          </div>
          <h4 className="heading-4 pb-4 pt-3">Help Centre</h4>
          <p className="pb-5 text-center">
            Looking for answers? Visit our Help Center for detailed guides
          </p>
          <a href="#" className="text-s1 underline font-medium">
            Help Center
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

  <section
  className="relative after:absolute after:bg-mainTextColor after:bottom-0 after:right-0 after:left-0 after:h-1/2 overflow-hidden"
>
  <div
    className="container bg-p1 py-12 sm:py-20 px-4 sm:px-10 md:px-20 lg:px-40 relative z-10 wow animate__animated animate__fadeInUp"
  >
    <img
      src="assets/images/sliceIcon.png"
      alt="image"
      className="absolute -top-4 sm:-top-6 lg:top-0 right-0 h-[60px] sm:h-[80px] lg:h-[120px] -rotate-90"
    />
    <p className="display-3 text-center text-white !leading-[130%]">
      Make Cub Hrm Part Of Your Work And Get Daily Update
    </p>
    <form onSubmit="{handleSubmit}" className="pt-6 sm:pt-10 relative">
      <div className="flex justify-center items-center gap-3 max-[500px]:flex-col">
        <input
          type="text"
          placeholder="Enter Your Email"
          className="border border-mainTextColor outline-none bg-white py-3 sm:py-4 px-4 md:px-8 max-[500px]:w-full lg:w-2/4"
        />
        <button
          className="border border-mainTextColor bg-s2 py-3 sm:py-4 px-4 md:px-8 font-medium"
        >
          Subscribe Now
        </button>
      </div>
    </form>
  </div>
</section>
 <footer className="bg-mainTextColor text-white/60">
  <div className="container grid grid-cols-12 stp-30 sbp-30 gap-6 max-xxl:pr-4">
    <div
      className="col-span-12 min-[450px]:col-span-6 lg:col-span-3 flex flex-col gap-6 lg:gap-8"
    >
      <a href="#">
        <img src="assets/images/logo_white.png" alt="image" />
      </a>
      <p className="">
        Your trusted partner in accounting and HRM solutions. We deliver
        precision, efficiency, and tailored services
      </p>
      <ul className="flex justify-start items-center gap-2">
        <li className="  ">
          <a
            className="bg-s1/50 rounded-full w-[40px] h-[40px] hover:bg-s1 duration-500 hover:-translate-y-1 text-white flex justify-center items-center"
            href="javascript:void(0)"
          >
            <i className="ph ph-facebook-logo leading-[0] text-2xl"></i>
          </a>
        </li>
        <li className="  ">
          <a
            className="bg-s1/50 rounded-full w-[40px] h-[40px] hover:bg-s1 duration-500 hover:-translate-y-1 text-white flex justify-center items-center"
            href="javascript:void(0)"
          >
            <i className="ph ph-reddit-logo leading-[0] text-2xl"></i>
          </a>
        </li>
        <li className="  ">
          <a
            className="bg-s1/50 rounded-full w-[40px] h-[40px] hover:bg-s1 duration-500 hover:-translate-y-1 text-white flex justify-center items-center"
            href="javascript:void(0)"
          >
            <i className="ph ph-youtube-logo leading-[0] text-2xl"></i>
          </a>
        </li>
        <li className="  ">
          <a
            className="bg-s1/50 rounded-full w-[40px] h-[40px] hover:bg-s1 duration-500 hover:-translate-y-1 text-white flex justify-center items-center"
            href="javascript:void(0)"
          >
            <i className="ph ph-pinterest-logo leading-[0] text-2xl"></i>
          </a>
        </li>
      </ul>
    </div>

    <div className="xl:pl-30 col-span-12 min-[400px]:col-span-6 lg:col-span-3">
      <h4
        className="heading-4 mb-6 pb-2 relative text-white after:absolute after:w-[20%] after:h-[2px] after:bottom-0 after:left-0 after:bg-p1 hover:after:w-[40%] after:duration-500"
      >
        Resources
      </h4>
      <ul className="flex flex-col gap-4 md:gap-5">
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            About Page
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            FAQs Page
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Blog
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Contact Us
          </a>
        </li>
      </ul>
    </div>
    <div className="xl:pl-30 col-span-12 min-[400px]:col-span-6 lg:col-span-3">
      <h4
        className="heading-4 mb-6 pb-2 relative text-white after:absolute after:w-[20%] after:h-[2px] after:bottom-0 after:left-0 after:bg-p1 hover:after:w-[40%] after:duration-500"
      >
        Services
      </h4>
      <ul className="flex flex-col gap-4 md:gap-5">
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Dentist Services
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Healthcare Services
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Taxations Services
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            Accounting Services
          </a>
        </li>
        <li>
          <a
            href="#"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            HRM Processing
          </a>
        </li>
      </ul>
    </div>

    <div className="col-span-12 min-[450px]:col-span-6 lg:col-span-3 xl:pl-30">
      <h4
        className="heading-4 mb-4 md:mb-6 pb-2 relative after:absolute after:w-[20%] after:h-[2px] after:bottom-0 after:left-0 after:bg-p1 hover:after:w-[40%] after:duration-500 text-white"
      >
        Get In Touch
      </h4>
      <ul className="flex flex-col gap-4 md:gap-3">
        <li>
          <a
            href="mailto:info@mail.com"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            <span className="text-2xl pt-2"
              ><i className="ph ph-envelope-simple-open"></i
            ></span>
            ems@vbrsit.com
            </a>
        </li>
        <li>
          <a
            href="tel:+1234579"
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            <span className="text-2xl pt-2"><i className="ph ph-phone-call"></i></span>
            +91 9705678967
          </a>
        </li>
        <li>
          <p
            className="flex justify-start items-center gap-2 hover:text-white hover:translate-x-2 duration-500"
          >
            <span className="text-2xl pt-2"
              ><i className="ph ph-paper-plane-tilt"></i
            ></span>
            1st Floor Unit # 117, Techno-1, Sy. No:86, 87(p), 88/1, Raidurg, Serilingampally, Ranga Reddy Dt. Telangana-500081
          </p>
        </li>
      </ul>
    </div>
  </div>
  <div className="border-t border-white/10">
    <div
      className="container py-6 flex justify-between items-center max-md:flex-col gap-6"
    >
      <p className="max-sm:text-center">
        Cub Hrm © Copyright 2025. All Rights Reserved.
      </p>
      <div className="flex justify-end items-center">
        <a
          href="#"
          className="border-r-2 border-white/60 pr-3 hover:text-white duration-500 leading-none"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          className="pl-3 hover:text-white duration-500 leading-none"
        >
          Terms & Conditions
        </a>
      </div>
    </div>
  </div>
</footer>

 <button
  className="fixed text-white text-xl sm:text-2xl rounded-full bg-p1 hover:bg-s2 border border-p1 hover:border-white right-6 md:right-10 p-2 sm:p-3 z-40 jumping1 duration-700 scrollButton scrollButtonHide !leading-[0]"
  aria-label="bottom to top button"
>
  <span className="block">
     <ArrowUp/>
  </span>
</button>
    </>
  );
};

export default LandingPage;
