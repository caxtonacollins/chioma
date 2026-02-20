'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ImageCarousel from '@/components/properties/ImageCarousel';
import Navbar from '@/components/Properties-navbar';
import Footer from '@/components/Footer';
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  ChevronLeft,
  Heart,
  Share2,
  CheckCircle,
} from 'lucide-react';

const properties = [
  {
    id: 1,
    price: '₦2,500,000',
    title: 'Luxury 2-Bed Apartment',
    location: '101 Adeola Odeku St, Victoria Island, Lagos',
    beds: 2,
    baths: 2,
    sqft: 1200,
    manager: 'Sarah Okafor',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    ],
    verified: true,
    description:
      "Experience luxury living in the heart of Victoria Island. This modern 2-bedroom apartment features premium finishes, an open-concept living area, and stunning city views. Residents enjoy 24/7 security, gym access, and proximity to Lagos's best restaurants and shopping.",
  },
  {
    id: 2,
    price: '₦3,800,000',
    title: 'Modern Loft in Lekki',
    location: 'Block 4, Admiralty Way, Lekki Phase 1',
    beds: 3,
    baths: 3,
    sqft: 1850,
    manager: 'David Ibrahim',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    ],
    verified: true,
    description:
      'A stylish and spacious loft located on the trending Admiralty Way. This 3-bedroom property offers industrial-chic design with high ceilings, large windows, and a private balcony. Perfect for urban professionals or families looking for a modern lifestyle.',
  },
  {
    id: 3,
    price: '₦1,500,000',
    title: 'Serviced Studio Flat',
    location: 'Glover Road, Ikoyi, Lagos',
    beds: 1,
    baths: 1,
    sqft: 600,
    manager: 'Chioma N.',
    images: [
      'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1536376074432-cd2258bb644d?w=800&h=600&fit=crop',
    ],
    verified: false,
    description:
      'Compact and convenient studio apartment in the exclusive Ikoyi neighborhood. Fully serviced with reliable power and water. Ideal for solo residents or as a quiet secondary residence in the city.',
  },
  {
    id: 4,
    price: '₦15,000,000',
    title: 'Exquisite 4-Bed Duplex',
    location: 'Banana Island, Ikoyi',
    beds: 4,
    baths: 5,
    sqft: 3200,
    manager: 'James Obi',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    ],
    verified: true,
    description:
      'Unparalleled luxury on Banana Island. This massive 4-bedroom duplex features world-class amenities, private pool access, and elite security. Designed for the most discerning residents who value privacy and elegance.',
  },
  {
    id: 5,
    price: '₦800,000',
    title: 'Cozy 1-Bed Apartment',
    location: 'Yaba, Mainland, Lagos',
    beds: 1,
    baths: 1,
    sqft: 500,
    manager: 'Emmanuel K.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1527359443443-84a48abc7df0?w=800&h=600&fit=crop',
    ],
    verified: false,
    description:
      'Affordable and cozy 1-bedroom apartment in the vibrant Yaba area. Close to tech hubs and universities. A great choice for young professionals starting their career in Lagos.',
  },
  {
    id: 6,
    price: '₦8,500,000',
    title: 'Penthouse with Sea View',
    location: 'Eko Atlantic City, Lagos',
    beds: 3,
    baths: 3,
    sqft: 2100,
    manager: 'Grace A.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501183315624-887f114a6ee2?w=800&h=600&fit=crop',
    ],
    verified: true,
    description:
      'Live in the city of the future. This breathtaking penthouse in Eko Atlantic offers panoramic sea views and state-of-the-art infrastructure. Modern, secure, and prestigious.',
  },
];

export default function PropertyDetails() {
  const { id } = useParams();
  const router = useRouter();

  const property = properties.find((p) => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <button
              onClick={() => router.push('/properties')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Back to Listings
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to search</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Carousel Container */}
            <div className="h-[400px] sm:h-[500px] w-full shadow-lg rounded-2xl overflow-hidden shadow-neutral-200">
              <ImageCarousel images={property.images} />
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {property.verified && (
                  <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Verified Listing
                  </div>
                )}
                <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
                  Smart Lease Ready
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 mb-8">
                <div className="flex flex-col items-center text-center">
                  <Bed className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-gray-900 font-bold">
                    {property.beds} Beds
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Bath className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-gray-900 font-bold">
                    {property.baths} Baths
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Ruler className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-gray-900 font-bold">
                    {property.sqft} sqft
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Manager */}
              <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-linear-to-r from-pink-400 to-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">
                    {property.manager}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Professional Property Manager
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 transition rounded-lg">
                  View Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100">
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {property.price}
                </span>
                <span className="text-gray-500 font-normal"> /year</span>
              </div>

              <div className="space-y-4 mb-8 text-neutral-800">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Move-in Date
                  </p>
                  <p className="font-medium">March 1st, 2026</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Lease Term
                  </p>
                  <p className="font-medium">1 Year (Renewable)</p>
                </div>
              </div>

              <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 mb-4">
                Initialize Smart Lease
              </button>

              <button className="w-full py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                Message Manager
              </button>

              <p className="text-center text-gray-400 text-xs mt-6">
                Leasing via Chioma requires a connected Stellar wallet for
                on-chain proof of lease.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
