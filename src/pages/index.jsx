import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FaTruck, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaShieldAlt, FaMoneyBillWave, FaStar, FaEnvelope, FaMapPin, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Eğer portal.tasiapp.com domain'inde isek
    if (typeof window !== 'undefined' && window.location.hostname === 'portal.tasiapp.com') {
      router.replace('/portal');
    }
  }, [router]);

  return null;
} 