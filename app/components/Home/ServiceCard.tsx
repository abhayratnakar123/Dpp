"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// SwiperSlider.js
export const ServiceCard = ({ imageUrl , title, description, link }:any) => {

  return (
    <Link href={link}>
      <motion.div
        className="bg-gray-200 rounded-lg shadow-md transition-transform hover:shadow-lg hover:scale-105 hover:bg-gray-100 mb-10"
        whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="mb-8 rounded-md w-full h-64 object-cover" />
        <h3 className="text-2xl font-semibold text-indigo-800 mb-4">{title}</h3>
        <p className="text-gray-600 sm:p-[27px]">{description}</p>
      </motion.div>
    </Link>
  );
};
