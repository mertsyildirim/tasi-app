'use client'

import React, { useState, useEffect } from 'react'
import { FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, FaSignOutAlt, FaSearch, FaEdit, FaTrash, FaPlus, FaEnvelope, FaMapPin, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaFileInvoiceDollar, FaUserShield } from 'react-icons/fa'
import { useRouter } from 'next/router'

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Ana admin sayfasından admin/index'e yönlendir
    router.replace('/admin/index')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Yönlendiriliyor...</h2>
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Admin paneline yönlendiriliyorsunuz, lütfen bekleyin.</p>
      </div>
    </div>
  )
} 