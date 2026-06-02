import { createFileRoute, useParams } from "@tanstack/react-router";
/* =========================
   BANNERS
========================= */

import jasBanner from "../../assets/logo.webp";
import excelBanner from "../../assets/excel-banner.webp";
import girishBanner from "../../assets/girish-banner1.webp";
import toothAlignBanner from "../../assets/tooth-align-banner.webp";
import houseBanner from "../../assets/house-of-teeth-banner.webp";
import makersBanner from "../../assets/makers-banner.webp";
import chaitanaBanner from "../../assets/chaitana-banner.webp";
import ecityBanner from "../../assets/ecity-banner.webp";
import allAboutTeethBanner from "../../assets/allaboutbanner.webp";
import niranjanBanner from "../../assets/niranjan-banner.webp";
import mjbBanner from "../../assets/mjb-banner.webp";
import rajBanner from "../../assets/raj-banner.webp";
import srikrishnaBanner from "../../assets/srikrishna-banner.webp";
import drraoBanner from "../../assets/drrao-banner.webp";
import mydentistBanner from "../../assets/mydentist-banner.webp";
import curaBanner from "../../assets/cura-banner.webp";
import rubyBanner from "../../assets/ruby-banner.webp";
import toothlifeBanner from "../../assets/toothlife-banner.webp";
import toothcornerBanner from "../../assets/toothcorner-banner.webp";

/* =========================
   DOCTORS
========================= */

import bashaDoctor from "../../assets/Basha Sir.webp";
import dikshyaDoctor from "../../assets/Dikshya Bose.webp";
import rizwanaDoctor from "../../assets/Dr Rizwana Tarannum.webp";
import girishDoctor from "../../assets/girish.webp";
import harithaDoctor from "../../assets/Haritha.webp";
import chandiniDoctor from "../../assets/chandini.webp";
import roliDoctor from "../../assets/Roli Singh.webp";
import chaitanaDoctor from "../../assets/chaitana-logo.webp";
import ecityDoctor from "../../assets/ecity-doctor.webp";
import allaboutDoctor from "../../assets/ManjuSangeetha.webp";
import niranjanDoctor from "../../assets/niranjan-doctor.webp";
import mjbDoctor from "../../assets/mjb-doctor.webp";
import rajDoctor from "../../assets/raj-doctor1.webp";
import rajDoctor1 from "../../assets/rajDoctor1.webp";
import srikrishnaDoctor from "../../assets/srikrishna-doctor.webp";
import mydentistDoctor from "../../assets/mydentist-doctor.webp";
import curaDoctor from "../../assets/cura-doctor.webp";
import rubyDoctor from "../../assets/ruby-doctor.webp";
import toothcornerDoctor from "../../assets/toothcorner-doctor.webp";

/* =========================
   GALLERY
========================= */

import jas1 from "../../assets/jasdental1.webp";
import jas2 from "../../assets/jasdental2.webp";
import jas3 from "../../assets/jasdental3.webp";
import jas4 from "../../assets/jasdental4.webp";
import jas5 from "../../assets/jasdental5.webp";

import chaitana1 from "../../assets/chaitana1.webp";
import chaitana2 from "../../assets/chaitana2.webp";
import chaitana3 from "../../assets/chaitana3.webp";

import ecity1 from "../../assets/ecity1.webp";
import ecity2 from "../../assets/ecity2.webp";
import ecity3 from "../../assets/ecity3.webp";
import ecity4 from "../../assets/ecity4.webp";
import ecity5 from "../../assets/ecity5.webp";
import ecity6 from "../../assets/ecity6.webp";

import allabout1 from "../../assets/allabout1.webp";
import allabout2 from "../../assets/allabout2.webp";
import allabout3 from "../../assets/allabout3.webp";
import allabout4 from "../../assets/allabout4.webp";

import niranjan1 from "../../assets/niranjan1.webp";
import niranjan2 from "../../assets/niranjan2.webp";
import niranjan3 from "../../assets/niranjan3.webp";
import niranjan4 from "../../assets/niranjan4.webp";
import niranjan5 from "../../assets/niranjan5.webp";
import niranjan6 from "../../assets/niranjan6.webp";

import mjb1 from "../../assets/mjb1.webp";
import mjb2 from "../../assets/mjb2.webp";
import mjb3 from "../../assets/mjb3.webp";
import mjb4 from "../../assets/mjb4.webp";
import mjb5 from "../../assets/mjb5.webp";
import mjb6 from "../../assets/mjb6.webp";

import srikrishna1 from "../../assets/srikrishna1.webp";
import srikrishna4 from "../../assets/srikrishna4.webp";
import srikrishna5 from "../../assets/srikrishna5.webp";
import srikrishna6 from "../../assets/srikrishna6.webp";
import srikrishna7 from "../../assets/srikrishna7.webp";
import srikrishna8 from "../../assets/srikrishna8.webp";

import drrao1 from "../../assets/drrao1.webp";
import drrao2 from "../../assets/drrao2.webp";

import mydentist1 from "../../assets/mydentist1.webp";
import mydentist2 from "../../assets/mydentist2.webp";
import mydentist3 from "../../assets/mydentist3.webp";

import cura1 from "../../assets/cura1.webp";
import cura2 from "../../assets/cura2.webp";
import cura3 from "../../assets/cura3.webp";
import cura4 from "../../assets/cura4.webp";

import ruby1 from "../../assets/ruby1.webp";
import ruby2 from "../../assets/ruby2.webp";
import ruby3 from "../../assets/ruby3.webp";
import ruby4 from "../../assets/ruby4.webp";
import ruby5 from "../../assets/ruby5.webp";

import toothcorner1 from "../../assets/toothcorner1.webp";
import toothcorner2 from "../../assets/toothcorner2.webp";
import toothcorner3 from "../../assets/toothcorner3.webp";
import toothcorner4 from "../../assets/toothcorner4.webp";
import toothcorner5 from "../../assets/toothcorner5.webp";
export const Route = createFileRoute("/clinics/$id")({
  component: ClinicPage,
});

const clinics = [
  {
    id: "jas-dental",
    name: "Jas Dental",

    logo: bashaDoctor,
    banner: jasBanner,

    description:
      "Jas Dental is a premium digital dentistry clinic focused on aesthetic smile design, precision restorations, and modern dental workflows. The clinic combines advanced technology with patient-centered care to deliver high-quality dental solutions.",

    location: "HSR Layout, Bengaluru",
    phone: "+91 9591111177",
    email: "jasasthetic@gmail.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8047997650115!2d77.64372107983766!3d12.920264054877379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae14815a26548b%3A0x9c84d0d7b3d64c71!2sJas%20Dental%20HSR%20LAYOUT!5e0!3m2!1sen!2sin!4v1778756659686!5m2!1sen!2sin",

    services: [
      "Smile Designing",
      "Dental Implants",
      "Root Canal Treatment",
      "Cosmetic Dentistry",
      "Teeth Whitening",
      "Digital Smile Analysis",
    ],

    gallery: [jas1, jas2, jas3, jas4, jas5],

    doctors: [
      {
        name: "Dr. Basha",
        role: "General & Family Dental Specialist",
        image: bashaDoctor,
        experience: "25+ Years Experience",

        phone: "",
        email: "",

        specialization: "General & Family Dentistry",

        clinicName: "JAS DENTAL",

        address: "Jakksandra,BTM Layout,HSR Layout, Bengaluru",

        website: "",
      },

      {
        name: "Dr Dikshya Bose",
        role: "General and Family Dentist",
        image: dikshyaDoctor,
        experience: "5+ Years Experience",

        phone: "",
        email: "",

        specialization: "General & Family Dentistry",

        clinicName: "JAS DENTAL",

        address: "BTM  Layout, Bengaluru",

        website: "",
      },
    ],
  },

  {
    id: "excel-dental",
    name: "Excel Dental",

    logo: rizwanaDoctor,
    banner: excelBanner,

    description:
      "Excel Dental is a modern cosmetic and restorative dental clinic delivering advanced smile transformations using precision digital workflows and premium patient care.",

    location: "JP Nagar 7th Phase, Bengaluru",
    phone: "+91 8792801460",
    email: "riz.zinu7@gmail.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.278711634221!2d77.58610237512148!3d12.889791487418137!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae157daab46707%3A0x6f0a7dcd1dc2ef6c!2sEXCEL%20DENTAL!5e0!3m2!1sen!2sin!4v1778758717122!5m2!1sen!2sin",

    services: [
      "Smile Designing",
      "Aligners",
      "Dental Veneers",
      "Laser Dentistry",
      "Crowns & Bridges",
      "Dental Implants",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr Rizwana Tarannum",
        role: "B.D.S (Certified Cosmetic Dentist)",
        image: rizwanaDoctor,
        experience: "Cosmetic Dental Specialist",

        phone: "8792801460",
        email: "riz.zinu7@gmail.com",

        specialization: "Zirconia Crown Specialist, Veneers Specialist, Smile Designing Specialist",

        clinicName: "Excel Dental",

        address: "JP Nagar 7th Phase, Bengaluru",

        website: "",
      },
    ],
  },

  {
    id: "girish-dental",
    name: "Girish Dental Clinic",

    logo: girishDoctor,
    banner: girishBanner,

    description:
      "Girish Dental Clinic specializes in advanced restorative and cosmetic dentistry with a strong focus on precision digital workflows, smile enhancement, and patient comfort.",

    location: "Wilson Garden, Bangalore",
    phone: "+91 9845988184",
    email: "enharishkumar@gmail.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.4156531443045!2d77.59437767512239!3d12.945233487367688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15c8eaaaaaab%3A0xef47bbdb60ed9112!2sGirish%20Dental%20Clinic!5e0!3m2!1sen!2sin!4v1778758983918!5m2!1sen!2sin",

    services: [
      "Digital Smile Design",
      "Dental Veneers",
      "Full Mouth Rehabilitation",
      "Root Canal Treatment",
      "Dental Crowns",
      "Teeth Whitening",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr E N Harish Kumar",
        role: "B.D.S.",
        image: girishDoctor,
        experience: "28+ Years Experience",

        phone: "9845988184",
        email: "enharishkumar@gmail.com",

        specialization: "Prosthodontics, Restorative Dentistry, Cosmetic Dentistry",

        clinicName: "Girish Dental Clinic",

        address:
          "#257/1, 13th Cross Wilson Garden, Next to Bharath Medical, Opp Naveen Nethralaya, Bangalore 560027",

        website: "",

        additionalInfo:
          "Senior Internship in Prosthodontics | Ex-Faculty K.G.F & BIDS Dental College | Year of Passing 1997 | Dental Council Registration No: 5007_A",
      },
    ],
  },

  {
    id: "tooth-align-clinic",
    name: "Tooth Align Clinic",

    logo: harithaDoctor,
    banner: toothAlignBanner,

    description:
      "Modern orthodontic and cosmetic dental center specializing in clear aligners and digital orthodontic workflows.",

    location: "HSR Layout, Bengaluru",
    phone: "+91 9398753235",
    email: "drharithatoothalign@gmail.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31113.62560606006!2d77.61199710014975!3d12.894651583372346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae151d534e9b1b%3A0xf82f6e96ff46d077!2sDr%20Haritha%20Tooth%20Align!5e0!3m2!1sen!2sin!4v1778759377794!5m2!1sen!2sin",

    services: [
      "Clear Aligners",
      "Smile Makeover",
      "Invisible Braces",
      "Orthodontic Treatment",
      "Teeth Whitening",
      "Digital Smile Planning",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr Haritha",
        role: "Dental Surgeon Dentist",
        image: harithaDoctor,
        experience: "14 Years Experience",

        phone: "9398753235 / 7090450469",
        email: "drharithatoothalign@gmail.com",

        specialization: "Dental Surgery & Smile Design",

        clinicName: "Tooth Align Multi Speciality Dental Clinic and Implant Center",

        address:
          "5th, 15th Cross Rd, Opposite Sandwich Guru, 6th Sector, HSR Layout, Bengaluru, Karnataka 560102",

        website: "https://g.co/kgs/G9W1DJn",
      },
    ],
  },

  {
    id: "house-of-teeth",
    name: "House Of Teeth",

    logo: chandiniDoctor,
    banner: houseBanner,

    description:
      "Premium cosmetic and restorative dental clinic focused on advanced smile transformations and personalized patient care.",

    location: "Singasandra, Bangalore",
    phone: "+91 8105189978",
    email: "houseofteeth888@gmail.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.355070382187!2d77.6403935751214!3d12.884874987422588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4d08f5a1da6d364f%3A0x78fb3e2cc4b92bb4!2sHouse%20of%20Teeth%20-%20The%20Dental%20Clinic!5e0!3m2!1sen!2sin!4v1778759149577!5m2!1sen!2sin",

    services: [
      "Smile Makeovers",
      "Dental Veneers",
      "Teeth Whitening",
      "Dental Implants",
      "Cosmetic Dentistry",
      "Digital Smile Design",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr Chandani",
        role: "BDS, MDS",
        image: chandiniDoctor,
        experience: "Senior Dental Specialist",

        phone: "8105189978",
        email: "houseofteeth888@gmail.com",

        specialization: "BDS, MDS ",

        clinicName: "House Of Teeth",

        address: "Bangalore, India",

        website: "",
      },
    ],
  },

  {
    id: "makers-of-smile",
    name: "Makers Of Smile",

    logo: roliDoctor,
    banner: makersBanner,

    description:
      "Contemporary dental clinic specializing in smile aesthetics and advanced restorative dentistry.",

    location: "Akshayanagar, Bengaluru",
    phone: "+91 7349137242",
    email: "contact@makersofsmile.com",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.6257408990964!2d77.61830057512108!3d12.867432487438434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6b2b5da50235%3A0xc79af7b75f34a14a!2sMakers%20Of%20Smile%20Dental%20Clinic!5e0!3m2!1sen!2sin!4v1778759257500!5m2!1sen!2sin",

    services: [
      "Smile Designing",
      "Cosmetic Dentistry",
      "Dental Veneers",
      "Invisible Aligners",
      "Teeth Whitening",
      "Full Mouth Rehabilitation",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr Roli Singh",
        role: "Implantologist & Dental Surgeon",
        image: roliDoctor,
        experience: "15 Years Experience",

        phone: "7349137242",
        email: "",

        specialization: "Implantology & Advanced Dental Surgery",

        clinicName: "Makers Of Smile Dental Clinic",

        address:
          "1st Floor, Begur Woods Layout, Plot#58, Devhuti Rockpile, Begur - Koppa Rd, Akshayanagar, Bengaluru, Karnataka 560076",

        website: "",
      },
    ],
  },
  {
    id: "dr-chaitana-dental-care",
    name: "Dr Chaitana’s Dental Care",

    logo: chaitanaDoctor,
    banner: chaitanaBanner,

    description:
      "Dr Chaitana’s Dental Care is a modern prosthodontic and cosmetic dental clinic focused on smile rehabilitation, implant planning, digital dentistry, aligners, veneers, and precision aesthetic treatments with advanced digital workflows.",

    location: "Electronic City Phase 1, Bengaluru",
    phone: "+91 7353190690",
    email: "drchaitanasdentalcare@gmail.com",

    map: "https://www.google.com/maps?q=Dr+Chaitana's+Dental+Care+Electronic+City+Bangalore&output=embed",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr Chaitana Biradar",
        role: "MDS Prosthodontist",

        image: chaitanaDoctor,

        experience: "16 Years Experience",

        phone: "7353190690",
        email: "drchaitanasdentalcare@gmail.com",

        specialization:
          "Prosthodontics, Smile Rehabilitation, Cosmetic Dentistry, Implant Planning",

        clinicName: "Dr Chaitana’s Dental Care",

        address:
          "Hanumanth Reddy Building, Next to Good Health Pharmacy, Near Godrej E-City, Doddathoguru, Electronic City Phase 1, Bengaluru, Karnataka 560100",

        website: "",

        additionalInfo:
          "MDS | Registration No: 25934A | Advanced Digital Dentistry & Prosthodontic Specialist",
      },
    ],
  },
  {
    id: "e-city-dental",
    name: "E City Dental",

    logo: ecityDoctor,
    banner: ecityBanner,

    description:
      "E City Dental is a modern multi-speciality dental center focused on advanced prosthodontics, cosmetic dentistry, digital smile planning, implant rehabilitation, and precision digital workflows with patient-centered care.",

    location: "Electronic City, Bengaluru",

    phone: "+91 9945529816",

    email: "teamecitydental@gmail.com",

    map: "https://www.google.com/maps?q=E+City+Dental+Electronic+City+Bangalore&output=embed",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [ecity1, ecity2, ecity3, ecity4, ecity5, ecity6],

    doctors: [
      {
        name: "Dr Ranjani Rao",

        role: "MPhil BDS",

        image: ecityDoctor,

        experience: "26 Years Experience",

        phone: "9945529816 / 8792470946",

        email: "teamecitydental@gmail.com",

        specialization: "Prosthodontics, Cosmetic Dentistry, Implantology, Digital Smile Design",

        clinicName: "E City Dental",

        address:
          "P-7 ELCIA Building, Phase 1, Electronics City, Hosur Main Road, Bengaluru, Karnataka 560100",

        website: "https://www.ecitydental.com",

        additionalInfo: "Medical Registration No: 7661-A | Advanced Digital Dentistry Specialist",
      },
    ],
  },
  {
    id: "all-about-teeth-dental-clinic",
    name: "All About Teeth Multispecialty Dental Clinic",
    logo: allaboutDoctor,
    banner: allAboutTeethBanner,
    description:
      "All About Teeth Multispecialty Dental Clinic is a modern dental center focused on prosthodontics, digital dentistry, smile designing, implant rehabilitation, cosmetic dentistry, and precision-driven patient care with advanced digital workflows.",
    location: "Kadubeesanahalli, Bengaluru",
    phone: "+91 8296343683",
    email: "allaboutteethclinic@gmail.com",
    map: "https://www.google.com/maps?q=NS+Complex,+20/5,+1st+Floor,+Above+Chef+Bakers,+ORR,+Kadubeesanahalli+Junction,+Bengaluru,+Karnataka+560103&output=embed",
    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],
    gallery: [allabout1, allabout2, allabout3, allabout4],
    doctors: [
      {
        name: "Dr. Manju Sangeetha",
        role: "MDS",
        image: allaboutDoctor,
        experience: "18+ Years Experience",
        phone: "8296343683",
        email: "allaboutteethclinic@gmail.com",
        specialization:
          "Prosthodontics, Oral Pathology, Cosmetic Dentistry, Implant Rehabilitation, Digital Dentistry",
        clinicName: "All About Teeth Multispecialty Dental Clinic",
        address:
          "NS Complex, 20/5, 1st Floor, Above Chef Bakers, ORR, Kadubeesanahalli Junction, Bengaluru, Karnataka 560103",
        additionalInfo:
          "Medical Registration No: 21461A | Advanced Prosthodontics & Digital Dentistry Specialist",
      },
    ],
  },
  {
    id: "niranjans-dental",

    name: "Niranjan’s Dental",

    logo: niranjanDoctor,

    banner: niranjanBanner,

    description:
      "Niranjan’s Dental is a premium multi-speciality dental clinic focused on prosthodontics, implant rehabilitation, smile designing, cosmetic dentistry, digital workflows, and precision-driven patient care with advanced modern dental technology.",

    location: "Jubilee Hills, Hyderabad",

    phone: "+91 9347196066",

    email: "niranjandentalclinic123@gmail.com",

    map: "https://www.google.com/maps?q=Niranjan’s+Dental,+Road+No+10B,+Jubilee+Hills,+Hyderabad,+Telangana+500033&output=embed",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [niranjan1, niranjan2, niranjan3, niranjan4, niranjan5, niranjan6],

    doctors: [
      {
        name: "Dr. S. Niranjan Reddy",

        role: "MDS",

        image: niranjanDoctor,

        experience: "29 Years Experience",

        phone: "9347196066",

        email: "niranjandentalclinic123@gmail.com",

        specialization:
          "Prosthodontics, Oral Medicine & Radiology, Cosmetic Dentistry, Implantology, Full Mouth Rehabilitation",

        clinicName: "Niranjan Dental",

        address: "Niranjan’s Dental, Road No 10B, Jubilee Hills, Hyderabad, Telangana 500033",

        website: "https://www.niranjansdental.com",

        additionalInfo:
          "Medical Registration No: A-3209 | Established in 2003 | Advanced Digital Dentistry Specialist",
      },
    ],
  },
  {
    id: "mjb-dental-clinic",

    name: "MJB Dental Clinic",

    logo: mjbDoctor,

    banner: mjbBanner,

    description:
      "MJB Dental Clinic is a modern multi-speciality dental center focused on prosthodontics, implantology, smile designing, cosmetic dentistry, aligners, and advanced digital dental treatment workflows with patient-centered care.",

    location: "Yousufguda, Hyderabad",

    phone: "+91 9885778820",

    email: "mjbdentist@gmail.com",

    map: "https://www.google.com/maps?q=8-3-231/A/281,+Sri+Krishna+Nagar,+Yousufguda,+Hyderabad,+Telangana+500045&output=embed",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [mjb1, mjb2, mjb3, mjb4, mjb5, mjb6],

    doctors: [
      {
        name: "Dr. M. Bharath Kumar",

        role: "BDS",

        image: mjbDoctor,

        experience: "26 Years Experience",

        phone: "9885778820",

        email: "mjbdentist@gmail.com",

        specialization:
          "Prosthodontics, Orthodontics, Endodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery",

        clinicName: "MJB Dental Clinic",

        address: "8-3-231/A/281, Sri Krishna Nagar, Yousufguda, Hyderabad, Telangana 500045",

        additionalInfo:
          "Medical Registration No: A-13561 | Established in 2003 | Advanced Digital Dentistry Specialist",
      },
    ],
  },
  {
    id: "raj-dental-clinic",

    name: "Raj Dental Clinic and Implant Center",

    logo: rajDoctor,

    banner: rajBanner,

    description:
      "Raj Dental Clinic and Implant Center is a modern multi-speciality dental practice focused on smile designing, implantology, veneers, zirconia crowns, cosmetic dentistry, full mouth rehabilitation, and advanced digital dentistry solutions.",

    location: "Malleshwaram, Bengaluru",

    phone: "+91 7618704189",

    email: "anushyb5@gmail.com",

    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5668567654525!2d77.5706213!3d12.9995326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17002e173d55%3A0x5a886a47ba5ce1b2!2sRaj%20Dental%20Clinic%20and%20Implant%20Center!5e0!3m2!1sen!2sus!4v1780038174594!5m2!1sen!2sus",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr. Rachana N Raj",

        role: "BDS",

        image: rajDoctor1,

        experience: "2+ Years Experience",

        phone: "7618704189",

        email: "anushyb5@gmail.com",

        specialization:
          "Prosthodontics, Orthodontics, Endodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery, Veneers, Zirconia Crowns, Full Mouth Rehabilitation",

        clinicName: "Raj Dental Clinic and Implant Center",

        address:
          "No.104, Ashirwad Arcade, 1st Floor, East Park Road, Opp Raghavendraswamy Matta, 8th Cross, Malleshwaram, Bengaluru - 560003",

        website: "https://www.instagram.com/rajdentalclinic2025",

        additionalInfo: "Medical Registration No: 61094A | Established in 2025",
      },

      {
        name: "Dr. Anush Y B",

        role: "BDS",

        image: rajDoctor,

        experience: "Dental Specialist",

        phone: "9742439549",

        email: "anushyb5@gmail.com",

        specialization:
          "Implantology, Cosmetic Dentistry, Smile Designing, Full Mouth Rehabilitation",

        clinicName: "Raj Dental Clinic and Implant Center",

        address:
          "No.104, Ashirwad Arcade, 1st Floor, East Park Road, Opp Raghavendraswamy Matta, 8th Cross, Malleshwaram, Bengaluru - 560003",
      },
    ],
  },
  {
    id: "sri-krishna-dental-health-care",

    name: "Sri Krishna Dental Health Care",

    logo: srikrishnaDoctor,

    banner: srikrishnaBanner,

    description:
      "Sri Krishna Dental Health Care is a modern dental clinic focused on smile design, implantology, aligners, veneers, cosmetic dentistry, pediatric dentistry, oral surgery, and advanced digital dental workflows.",

    location: "Uttarahalli, Bengaluru",

    phone: "+91 9113997388",

    email: "drchandan.skdhc@gmail.com",

    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0323227559093!2d77.54033077512176!3d12.905643137403649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3f6db0a3cc1f%3A0xcc2c87c3e0965f3c!2sSri%20Krishna%20Dental%20Health%20Care!5e0!3m2!1sen!2sin!4v1780118657748!5m2!1sen!2sin",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [srikrishna1, srikrishna4, srikrishna5, srikrishna6, srikrishna7, srikrishna8],

    doctors: [
      {
        name: "Dr. Chandan N",

        role: "BDS",

        image: srikrishnaDoctor,

        experience: "4 Years Experience",

        phone: "9113997388",

        email: "drchandan.skdhc@gmail.com",

        specialization:
          "Prosthodontics, Orthodontics, Endodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery",

        clinicName: "Sri Krishna Dental Health Care",

        address:
          "No.23/A, Gubbalala Main Road, Friends Colony, Uttarahalli, Bengaluru, Karnataka 560061",

        additionalInfo: "Medical Registration No: 55354A | Established in 2026",
      },
    ],
  },
  {
    id: "dr-raos-multispeciality-dental-clinic",

    name: "DR Rao's Multispeciality Dental Clinic",

    logo: drraoBanner,

    banner: drraoBanner,

    description:
      "DR Rao's Multispeciality Dental Clinic is a modern dental center focused on implantology, smile designing, aligners, veneers, cosmetic dentistry, oral surgery, and comprehensive digital dental care.",

    location: "HSR Layout, Bengaluru",

    phone: "+91 9008159445",

    email: "drhanumantharao5@gmail.com",

    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.817838828609!2d77.644117875122!3d12.919426587391142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae152612abb4d5%3A0xcdefd74407be2d5d!2sDr.Rao%27s%20multispeciality%20Dental%20clinic!5e0!3m2!1sen!2sus!4v1780120051725!5m2!1sen!2sus",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [drrao1, drrao2],

    doctors: [
      {
        name: "Dr. Hanumantha Rao",

        role: "BDS, Dental Implantologist",

        image: drraoBanner,

        experience: "5 Years Experience",

        phone: "9008159445",

        email: "drhanumantharao5@gmail.com",

        specialization:
          "Prosthodontics, Orthodontics, Endodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery",

        clinicName: "DR Rao's Multispeciality Dental Clinic",

        address:
          "No.45, 1st Floor, 7th Cross, 24th Main, Agara, HSR Layout 1st Sector, Bengaluru, Karnataka 560102",

        additionalInfo: "Medical Registration No: 57291A | Established in 2025",
      },
    ],
  },
  {
    id: "my-dentist-clinic",

    name: "My Dentist",

    logo: mydentistDoctor,

    banner: mydentistBanner,

    description:
      "My Dentist is a patient-focused dental clinic specializing in smile designing, aligners, veneers, implantology, cosmetic dentistry, pediatric dentistry, oral surgery, and advanced digital dental care.",

    location: "Neelasandra, Bengaluru",

    phone: "+91 7019551416",

    email: "wikharuddin@gmail.com",

    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.272780366838!2d77.61317497512253!3d12.954388987359417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15006b4de7a9%3A0x1dcb74a09313018!2sMy%20Dentist!5e0!3m2!1sen!2sin!4v1780121066218!5m2!1sen!2sin",
    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [mydentist1, mydentist2, mydentist3],

    doctors: [
      {
        name: "Dr. Wikharuddin",

        role: "BDS",

        image: mydentistDoctor,

        experience: "3 Years Experience",

        phone: "7019551416",

        email: "wikharuddin@gmail.com",

        specialization:
          "Prosthodontics, Orthodontics, Endodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery",

        clinicName: "My Dentist",

        address:
          "Bazaar Street, Rose Garden, Richard Xavier's Colony, Neelasandra, Bengaluru, Karnataka 560047",

        additionalInfo: "Medical Registration No: 57565A | Established in 2024",
      },
    ],
  },
  {
    id: "cura-dental-clinic",

    name: "Cura Dental Clinic",

    logo: curaDoctor,

    banner: curaBanner,

    description:
      "Cura Dental Clinic provides comprehensive dental care with expertise in prosthodontics, implantology, cosmetic dentistry, smile designing, aligners, veneers, and full mouth rehabilitation using modern digital workflows.",

    location: "HSR Layout, Bengaluru",

    phone: "+91 8095303570",

    email: "curadentalindia@gmail.com",

    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9272209273695!2d77.63771847512183!3d12.912399137397525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15ff1fb2c471%3A0x9b4b90bb4940991d!2sCura%20Dental%2C%20Advanced%20Multispeciality%20Clinic!5e0!3m2!1sen!2sus!4v1780123473361!5m2!1sen!2sus",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [cura1, cura2, cura3, cura4],

    doctors: [
      {
        name: "Dr. Simin Kittur",

        role: "MDS",

        image: curaDoctor,

        experience: "8 Years Experience",

        phone: "8095303570",

        email: "curadentalindia@gmail.com",

        specialization:
          "Prosthodontics, Implantology, Cosmetic Dentistry, Smile Designing, Veneers, Full Mouth Rehabilitation",

        clinicName: "Cura Dental Clinic",

        address:
          "23rd Cross, 9th Main, 1st Floor, No.380, Sector 7, HSR Layout, Bengaluru, Karnataka 560068",

        website: "https://curadentalhsr.com",

        additionalInfo: "Medical Registration No: 43672A | Established in 2024",
      },
    ],
  },
  {
    id: "dr-rubys-dental-care",

    name: "Dr Ruby's Dental Care",

    logo: rubyDoctor,

    banner: rubyBanner,

    description:
      "Dr Ruby's Dental Care is a patient-focused dental clinic delivering advanced smile designing, aligners, veneers, implantology, cosmetic dentistry, pediatric dentistry, oral surgery, and complete digital dental care solutions.",

    location: "BTM 1st Stage, Bengaluru",

    phone: "+91 8618513520",

    email: "rubiena88@gmail.com",

    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8110225457817!2d77.608259975122!3d12.919864387390742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1585c2f41a5f%3A0x52e17eacec2c637e!2sDr.RUBY%27S%20DENTAL%20CARE!5e0!3m2!1sen!2sus!4v1780127388079!5m2!1sen!2sus",
    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [ruby1, ruby2, ruby3, ruby4, ruby5],

    doctors: [
      {
        name: "Dr. Rubeena Paramban",

        role: "BDS",

        image: rubyDoctor,

        experience: "13 Years Experience",

        phone: "8618513520",

        email: "rubiena88@gmail.com",

        specialization:
          "General Dentistry, Cosmetic Dentistry, Implantology, Smile Designing, Aligners, Veneers, Full Mouth Rehabilitation",

        clinicName: "Dr Ruby's Dental Care",

        address:
          "1st Floor, #65/A, Ganga Nilaya, 8th Cross, 60 Feet Road, Narayan Gowda Layout, BTM 1st Stage, Bengaluru, Karnataka 560029",

        additionalInfo: "Kerala Dental Council Registration No: 11325 | Established in 2021",
      },
    ],
  },
  {
    id: "toothlife-clinic",

    name: "TOOTHLIFE",

    logo: toothlifeBanner,

    banner: toothlifeBanner,

    description:
      "TOOTHLIFE is a patient-focused dental clinic led by Dr. Koel Debnath, offering advanced periodontology, smile designing, implantology, aligners, veneers, cosmetic dentistry, and full mouth rehabilitation.",

    location: "Haralur, Bengaluru",

    phone: "+91 8217707232",

    email: "toothlife23@gmail.com",

    map: "https://www.google.com/maps?q=Toothlife+Haralur+Bengaluru+560102&output=embed",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [],

    doctors: [
      {
        name: "Dr. Koel Debnath",

        role: "MDS",

        image: toothlifeBanner,

        experience: "10 Years Experience",

        phone: "8217707232",

        email: "toothlife23@gmail.com",

        specialization:
          "Periodontology, Prosthodontics, Orthodontics, Endodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery",

        clinicName: "TOOTHLIFE",

        address: "Toothlife, Haralur, Bengaluru, Karnataka 560102",

        additionalInfo: "Medical Registration No: 29821A | Established in 2022",
      },
    ],
  },
  {
    id: "the-tooth-corner",

    name: "The Tooth Corner",

    logo: toothcornerDoctor,

    banner: toothcornerBanner,

    description:
      "The Tooth Corner is a patient-focused dental clinic led by Dr. Shabnam, offering advanced endodontics, smile designing, aligners, veneers, implantology, cosmetic dentistry, and full mouth rehabilitation.",

    location: "Bellandur, Bengaluru",

    phone: "+91 8008816763",

    email: "thetoothcornerdental@gmail.com",

    map: "https://www.google.com/maps?q=Shop+No+09+AGR+Prime+151+Cherry+Lane+Bellandur+Bengaluru+560103&output=embed",

    services: [
      "Smile Design",
      "Aligners",
      "Veneers",
      "Crown Design",
      "Implant Planning",
      "Full Mouth Rehabilitation",
      "Digital Smile Planning",
      "3D Design Services",
      "Consultation Support",
      "Lab Support",
    ],

    gallery: [toothcorner1, toothcorner2, toothcorner3, toothcorner4, toothcorner5],

    doctors: [
      {
        name: "Dr. Shabnam",

        role: "MDS (Conservative Dentistry & Endodontics)",

        image: toothcornerDoctor,

        experience: "6+ Years Experience",

        phone: "8008816763",

        email: "thetoothcornerdental@gmail.com",

        specialization:
          "Endodontics, Prosthodontics, Orthodontics, Implantology, Cosmetic Dentistry, General Dentistry, Pediatric Dentistry, Oral Surgery",

        clinicName: "The Tooth Corner",

        address:
          "Shop No: 09, AGR Prime, 151 Cherry Lane, Below Ratnadeep Super Market, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103",

        website: "https://thetoothcorner.in",

        additionalInfo: "Medical Registration No: 61240A | Established in 2024",
      },
    ],
  },
];

function ClinicPage() {
  const { id } = useParams({ strict: false });

  const clinic = clinics.find((c) => c.id === id);

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold">
        Clinic Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative h-[280px] sm:h-[380px] md:h-[500px] overflow-hidden">
        <img
          src={clinic.banner}
          alt={clinic.name}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight">
            {clinic.name}
          </h1>

          <p className="text-white/80 mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-7">
            Advanced Digital Dentistry & Smile Design
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <img
              src={clinic.logo}
              alt={clinic.name}
              loading="eager"
              decoding="async"
              className="rounded-[32px] shadow-2xl w-full max-w-[520px] h-[620px] object-cover object-top bg-white mx-auto"
            />
          </div>

          <div>
            <p className="uppercase tracking-[4px] text-purple-600 font-semibold mb-4 text-xs sm:text-sm">
              About The Clinic
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 sm:mb-8">
              Precision Dentistry With Modern Technology
            </h2>

            <p className="text-gray-600 leading-7 sm:leading-8 text-base sm:text-lg">
              {clinic.description}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 mt-8 sm:mt-10">
              <div className="bg-purple-50 rounded-2xl p-5 border">
                <p className="text-sm text-gray-500 mb-2">Location</p>

                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {clinic.location}
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-5 border">
                <p className="text-sm text-gray-500 mb-2">Phone</p>

                <p className="font-semibold text-gray-900 text-sm sm:text-base">{clinic.phone}</p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-5 border">
                <p className="text-sm text-gray-500 mb-2">Email</p>

                <p className="font-semibold text-gray-900 break-all text-sm sm:text-base">
                  {clinic.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">Specialized Dental Treatments</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {clinic.services.map((service) => (
              <div
                key={service}
                className="group bg-white border rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-6">
                  🦷
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">{service}</h3>

                <p className="text-gray-600 leading-7">
                  Premium quality treatment using modern digital workflows.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold"> Inside {clinic.name}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {clinic.gallery.map((img) => (
              <div key={img} className="overflow-hidden rounded-[24px] sm:rounded-[32px]">
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[240px] sm:h-[320px] object-cover hover:scale-105 transition-transform duration-300 will-change-transform"
                />
              </div>
            ))}
          </div>
        </section>

        {/* DOCTORS */}
        {clinic.doctors && (
          <section className="mt-20 sm:mt-28">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-5xl font-bold">Specialists Behind The Smiles</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
              {clinic.doctors.map((doctor) => (
                <div
                  key={doctor.name}
                  className="bg-white border rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-xl max-w-[500px] mx-auto w-full hover:-translate-y-2 transition-all duration-300"
                >
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[4/5] object-cover object-top hover:scale-105 transition-transform duration-300 will-change-transform"
                  />

                  <div className="p-5 sm:p-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      {doctor.name}
                    </h3>

                    <p className="text-purple-600 text-base sm:text-lg mb-3">{doctor.role}</p>

                    <div className="space-y-3 mt-4">
                      <p className="text-gray-500 font-medium">{doctor.experience}</p>

                      {doctor.specialization && (
                        <p className="text-gray-700 leading-7">{doctor.specialization}</p>
                      )}

                      {doctor.phone && <p className="text-sm text-gray-600">📞 {doctor.phone}</p>}

                      {doctor.email && (
                        <p className="text-sm text-gray-600 break-all">✉️ {doctor.email}</p>
                      )}

                      {doctor.clinicName && (
                        <p className="text-sm text-gray-600">🏥 {doctor.clinicName}</p>
                      )}

                      {doctor.address && (
                        <p className="text-sm text-gray-600 leading-6">📍 {doctor.address}</p>
                      )}

                      {doctor.additionalInfo && (
                        <p className="text-sm text-gray-500 leading-6 border-t pt-3">
                          {doctor.additionalInfo}
                        </p>
                      )}

                      {doctor.website && (
                        <a
                          href={doctor.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-2 text-purple-600 font-semibold hover:underline"
                        >
                          Visit Clinic
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
      {/* MAP SECTION */}
      {clinic.map && (
        <section className="mt-20 sm:mt-28">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">Visit Our Clinic</h2>

            <p className="text-gray-600 mt-4">Find us easily with Google Maps navigation.</p>
          </div>

          <div className="overflow-hidden rounded-[32px] shadow-2xl border border-gray-200">
            <iframe
              src={clinic.map}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </section>
      )}
    </div>
  );
}

export default ClinicPage;
