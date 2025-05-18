// DashboardSidebar.jsx - Updated with role-based menu items
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import useAuthStore from '../stores/authStore';

const DashboardSidebar = ({
    userData,
    sidebarOpen,
    toggleSidebar,
    handleLogout,
    navigateToKelolaKegiatan,
    navigateToSeePresensi,
    navigateToKelolaTugas,
    navigateToAlQuran,
    navigateToPresensi,
    navigateToTugas,
    navigateToProfile,
    navigateToMY,
    navigateToScan,
    closeSidebar,
    isMobile
}) => {
    const { role } = useAuthStore();

    // Base menu items that can be filtered by role
    const allMenuItems = [
        {
            id: 'profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            label: "Profile",
            onClick: () => {
                navigateToProfile();
                closeSidebar && closeSidebar();
            },
            roles: ['0a', '0b', '1a']
        },
        {
            id: 'my',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            label: "Mutaba'ah Yaumiyah",
            onClick: () => {
                navigateToMY();
                closeSidebar && closeSidebar();
            },
            roles: ['all']
        },
        {
            id: 'quran',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            label: "Al-Quran",
            onClick: () => {
                navigateToAlQuran();
                closeSidebar && closeSidebar();
            },
            roles: ['all']
        },
        {
            id: 'presensi',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            label: "Presensi",
            onClick: () => {
                navigateToPresensi();
                closeSidebar && closeSidebar();
            },
            roles: ['1a']
        },
        {
            id: 'tugas',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            label: "Tugas",
            onClick: () => {
                navigateToTugas();
                closeSidebar && closeSidebar();
            },
            roles: ['1a', '2c', '3']
        },
        {
            id: 'scanqr',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
            ),
            label: "Scan QR",
            onClick: () => {
                navigateToScan();
                closeSidebar && closeSidebar();
            },
            roles: ['2c']
        },
        {
            id: 'kelola-tugas',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            label: "Kelola Tugas",
            onClick: () => {
                navigateToKelolaTugas();
                closeSidebar && closeSidebar();
            },
            roles: ['3', '4']
        },
        {
            id: 'lihat-presensi',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            label: "Lihat Presensi",
            onClick: () => {
                navigateToSeePresensi();
                closeSidebar && closeSidebar();
            },
            roles: ['3', '4']
        },
        {
            id: 'kegiatan',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18m-7 5h7M3 17h7m-7 0a2 2 0 01-2-2V7a2 2 0 012-2m0 10a2 2 0 002-2V7a2 2 0 00-2-2m0 10h18" />
                </svg>
            ),
            label: "Kelola Kegiatan",
            onClick: () => {
                navigateToKelolaKegiatan();
                closeSidebar && closeSidebar();
            },
            roles: ['3', '4']
        }
    ];


    // Filter menu items based on user role
    const getFilteredMenuItems = () => {
        return allMenuItems.filter(item => {
            if (item.roles.includes('all')) return true;
            return item.roles.includes(role);
        });
    };

    const menuItems = getFilteredMenuItems();

    // Generate appropriate classes for sidebar based on mobile/desktop and open/closed state
    const getSidebarClasses = () => {
        if (isMobile) {
            // Mobile: slide in/out but keep sidebar above content with higher z-index
            return `${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed z-40 w-64`;
        } else {
            // Desktop: expand/collapse in place
            return `${sidebarOpen ? 'w-64' : 'w-16'}`;
        }
    };

    return (
        <>
            {/* Sidebar component */}
            <aside
                className={`${getSidebarClasses()} 
                    bg-blue-900 text-white shadow-xl h-full overflow-hidden
                    transition-all duration-300 ease-in-out flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-blue-800 h-16">
                    {/* Show logo only when sidebar is open (both mobile and desktop) */}
                    {sidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/img/logossg_white.png"
                                alt="Logo Santri Siap Guna"
                                width={28}
                                height={28}
                                className="rounded-full"
                            />
                            <span className="text-lg font-bold">SANTRI SIAP GUNA</span>
                        </div>
                    )}

                    {/* Mobile: Close button (X) */}
                    {isMobile && sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors duration-300"
                            aria-label="Close sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Desktop: Toggle button */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`text-white hover:bg-blue-800 rounded-full p-2 transition-colors duration-300 ${!sidebarOpen ? 'mx-auto' : ''}`}
                            aria-label="Toggle sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="py-4 flex-grow overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={item.onClick}
                                    className={`flex items-center w-full ${sidebarOpen ? 'p-3 px-4 text-left' : 'p-3 justify-center'} 
                                        hover:bg-blue-800 text-white transition-colors duration-300 group`}
                                    title={sidebarOpen ? "" : item.label}
                                >
                                    <span className={`${sidebarOpen ? 'mr-3' : ''}`}>{item.icon}</span>
                                    {sidebarOpen && <span className="text-sm">{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Section */}
                <div className="border-t border-blue-800 mt-auto">
                    <button
                        onClick={() => {
                            handleLogout();
                            closeSidebar && closeSidebar();
                        }}
                        className={`flex items-center w-full ${sidebarOpen ? 'p-3 px-4 text-left' : 'p-3 justify-center'} 
                            text-white transition-colors duration-300 hover:bg-blue-800`}
                        title={sidebarOpen ? "" : "Logout"}
                    >
                        <span className={`${sidebarOpen ? 'mr-3' : ''}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </span>
                        {sidebarOpen && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;