"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../components/navbar";

const HomePage = () => {
  // State to track viewport size
  const [isMobile, setIsMobile] = useState(false);

  // Effect to detect viewport size on mount and when window resizes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  // Function to handle smooth scrolling to the about section
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      // Get the height of the navbar for offset calculation
      const navbarHeight = 64;

      // Get the element's position relative to the viewport
      const aboutRect = aboutSection.getBoundingClientRect();

      // Calculate the absolute position of the element on the page
      const aboutPosition = aboutRect.top + window.pageYOffset;

      // Scroll to the element with offset for the navbar
      window.scrollTo({
        top: aboutPosition - navbarHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen font-poppins overflow-x-hidden">
      {/* Header with navigation */}
      <Navbar />

      {/* Main content */}
      <main>
        {/* Hero section - full screen with background image */}
        <div id="home" className="relative w-full h-screen overflow-hidden">
          {/* Background image (bghome.png) - behind everything */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/img/bghome.png"
              alt="Background Pattern"
              fill
              priority
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>

          {/* activity_home.png - on top of bghome.png */}
          <div className="absolute z-10 inset-0">
            {isMobile ? (
              // Mobile version positioned just above the "Baca Selengkapnya" button
              <div className="absolute bottom-24 left-0 right-0 h-2/5">
                <Image
                  src="/img/activity_home.png"
                  alt="Activity Home"
                  fill
                  priority
                  style={{
                    objectFit: "contain",
                    objectPosition: "center bottom",
                  }}
                />
              </div>
            ) : (
              // Desktop version covering the whole area
              <Image
                src="/img/activity_home.png"
                alt="Activity Home"
                fill
                priority
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            )}
          </div>

          {/* Blue pattern overlay */}
          <div
            className="absolute inset-0 z-20 opacity-80"
            style={{
              background: "url(/img/blue-pattern.png)",
              backgroundSize: "cover",
              mixBlendMode: "overlay",
            }}
          ></div>

          {/* Optional overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/10 z-30"></div>

          {/* Main heading content - adjusted position to center for mobile */}
          <div
            className="absolute z-40 inset-0 flex flex-col items-center"
            style={{ paddingTop: isMobile ? "40vh" : "12vh" }}
          >
            <div className="text-center px-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="mb-6">
                  <h1
                    className={`${
                      isMobile ? "text-3xl" : "text-4xl"
                    } sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight`}
                  >
                    <span className="text-white">Mengubah</span>
                    {isMobile ? " " : <br />}
                    <span className="text-amber-500">Kepribadian</span>
                    <span className="text-white"> Menjadi </span>
                    {isMobile ? " " : <br />}
                    <span className="text-amber-500">Lebih </span>
                    <span className="text-blue-950">Baik.</span>
                  </h1>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* "Baca Selengkapnya" button */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="absolute z-40 bottom-16 left-0 w-full flex justify-center"
          >
            <motion.button
              variants={itemVariants}
              onClick={scrollToAbout}
              className="flex items-center space-x-2 bg-gray-300/30 backdrop-blur-sm text-white font-medium py-3 px-6 sm:px-8 rounded-full border border-white/20 cursor-pointer"
              type="button"
              aria-label="Baca selengkapnya"
            >
              <span>Baca Selengkapnya</span>
            </motion.button>
          </motion.div>

          {/* Removed the "Baca Selengkapnya" text from bottom left */}
        </div>

        {/* About Us section with orange-bordered image */}
        <section
          id="about"
          className="relative min-h-screen sm:h-screen flex flex-col pt-10 pb-12 px-6 sm:px-8 md:px-16 lg:px-20 overflow-hidden"
        >
          {/* About Us heading with improved positioning for mobile - moved higher */}
          <div className="relative z-10 -mt-4 mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black text-left">
              ABOUT US.
            </h2>
          </div>

          {/* Background pattern - hidden on mobile, visible on larger screens */}
          <div className="absolute inset-0 z-0 hidden sm:block">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-full h-full relative">
                <Image
                  src="/img/bgabout.png"
                  alt="Background Pattern"
                  fill
                  style={{
                    objectFit: "contain",
                    opacity: 0.85,
                    transform: "scale(1.05)", // Slightly increased the image size by 5%
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto w-full flex-grow flex items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full"
            >
              <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-8 sm:gap-16">
                <div className="w-full sm:w-6/12">
                  <div className="mb-6 sm:mb-8">
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl ml-0">
                      Santri Siap Guna (SSG) Daarut Tauhiid merupakan sebuah
                      program pendidikan dan latihan yang dirancang untuk
                      membentuk generasi muda yang berkarakter BAKU (Baik dan
                      Kuat), dengan fokus pada pemahaman dasar keislaman agar
                      mampu mengenali diri dan juga Rabb-Nya.
                    </p>
                  </div>

                  <div>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl ml-0 sm:ml-10">
                      Santri Siap Guna (SSG) Daarut Tauhiid merupakan program
                      pelatihan intensif yang memadukan aspek spiritual dan
                      praktis. Dengan pendekatan komprehensif, kami menyiapkan
                      generasi muda Muslim untuk menghadapi tantangan dunia
                      modern sambil tetap berpegang pada nilai-nilai Islam yang
                      kuat.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-5/12 flex justify-center sm:justify-end mb-8 sm:mb-0">
                  <div
                    className="relative w-4/5 sm:w-auto overflow-hidden sm:ml-auto"
                    style={{ transform: "scale(1.254)" }}
                  >
                    {/* Orange border frame with image and name - hidden on mobile, visible on sm and up */}
                    <div className="hidden sm:block border-4 border-amber-500 p-2 sm:p-3">
                      <div className="relative overflow-hidden">
                        <Image
                          src="/img/aagym.png"
                          alt="KH. Abdullah Gymnastyar"
                          width={564}
                          height={702}
                          className="w-full h-auto"
                        />
                      </div>
                      {/* Name caption below the image */}
                      <div className="py-2 sm:py-3 text-center">
                        <p className="font-medium text-gray-800 text-base sm:text-lg">
                          KH. Abdullah Gymnastyar
                        </p>
                      </div>
                    </div>

                    {/* Mobile version without orange border */}
                    <div className="block sm:hidden">
                      <div className="relative overflow-hidden">
                        <Image
                          src="/img/aagym.png"
                          alt="KH. Abdullah Gymnastyar"
                          width={564}
                          height={702}
                          className="w-full h-auto"
                        />
                      </div>
                      {/* Name caption below the image */}
                      <div className="py-2 sm:py-3 text-center">
                        <p className="font-medium text-gray-800 text-base sm:text-lg">
                          KH. Abdullah Gymnastyar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact section */}
        <section
          id="contact"
          className="relative py-12 px-6 sm:px-8 md:px-16 lg:px-20"
        >
          {/* Background image for contact section */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/img/bgcontact.png"
              alt="Contact Background"
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>

          {/* Optional overlay to ensure content readability */}
          <div className="absolute inset-0 bg-black/30 z-10"></div>

          <div className="container mx-auto max-w-6xl relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* First column */}
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-4">
                  LPM DT PEDULI
                </h3>
                <p className="text-sm mb-6 text-gray-200">
                  LPM (Lembaga Pengabdian Masyarakat) DT Peduli merupakan sebuah
                  lembaga dibawah naungan Yayasan Daarut Tauhiid (DT) Peduli
                  yang bergerak dalam bidang Pendidikan-Pelatihan Karakter Baik
                  & Kuat (KUAT) berbasis Manajemen Qolbu dan program-program
                  kemanusiaan baik dalam tahap mitigasi, tanggap darurat maupun
                  rehabilitasi-rekonstruksi.
                </p>

                {/* Logo section */}
                <div className="flex items-center space-x-4 mt-6">
                  <Image
                    src="/img/logo_DT READY_white.png"
                    alt="DT Ready Logo"
                    width={120}
                    height={40}
                    className="h-auto"
                  />
                  <Image
                    src="/img/logolpmdanssg_white.png"
                    alt="DT Peduli Logo"
                    width={120}
                    height={40}
                    className="h-auto"
                  />
                </div>
              </div>

              {/* Second column - duplicated LPM info for mobile layout */}
              <div className="text-left md:hidden lg:block">
                <h3 className="text-2xl font-bold text-white mb-4">
                  LPM DT PEDULI
                </h3>
                <p className="text-sm mb-6 md:hidden lg:block text-gray-200">
                  LPM (Lembaga Pengabdian Masyarakat) DT Peduli merupakan sebuah
                  lembaga dibawah naungan Yayasan Daarut Tauhiid (DT) Peduli
                  yang bergerak dalam bidang Pendidikan-Pelatihan Karakter Baik
                  & Kuat (KUAT) berbasis Manajemen Qolbu dan program-program
                  kemanusiaan baik dalam tahap mitigasi, tanggap darurat maupun
                  rehabilitasi-rekonstruksi.
                </p>

                {/* Social media links */}
                <div className="flex items-center space-x-4 mt-6">
                  <a
                    href="https://facebook.com/dtpeduli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 p-2 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/dtpeduli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-2 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/6281234500556"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 p-2 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/dtpeduli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 p-2 rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Third column - Contact info */}
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-4">
                  HUBUNGI KAMI DI
                </h3>

                <div className="space-y-4">
                  {/* Email with SVG icon */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#333"
                      >
                        <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-200">
                      info.lpm@dtpeduli.org
                    </p>
                  </div>

                  {/* Phone with SVG icon */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#333"
                      >
                        <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-200">081234500556</p>
                  </div>

                  {/* Map container */}
                  <div className="mt-4 rounded-lg overflow-hidden border-4 border-white">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d991.2321290798354!2d107.58934786953588!3d-6.8643179981966885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6bc4dd69ba5%3A0xea582de3c7a89e25!2sSantri%20Siap%20Guna%20Daarut%20Tauhiid!5e0!3m2!1sen!2sid!4v1710793612965!5m2!1sen!2sid"
                      width="100%"
                      height="180"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Santri Siap Guna Daarut Tauhiid Location"
                    ></iframe>
                  </div>

                  {/* Address with SVG icon */}
                  <div className="flex items-start space-x-3">
                    <div className="bg-white p-2 rounded-full mt-1 flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#333"
                      >
                        <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-200">
                      Blok Gegerkalong Girang No.57, Kel. Gegerkalong Kec.
                      Sukasari
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social media links for mobile/tablet view */}
            <div className="md:flex lg:hidden justify-center mt-8 space-x-6 hidden">
              <a
                href="https://facebook.com/dtpeduli"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/dtpeduli"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/6281234500556"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/dtpeduli"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Optional footer with copyright */}
        <footer className="bg-gray-800 py-4 text-center text-white text-sm">
          <p>
            © {new Date().getFullYear()} LPM DT Peduli Santri Siap Guna (SSG). All Rights Reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
