import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import bashaDoctor from "@/assets/Basha Sir.webp";
import rizwanaDoctor from "@/assets/Dr Rizwana Tarannum.webp";
import girishDoctor from "@/assets/girish.webp";
import harithaDoctor from "@/assets/Haritha.webp";
import chandiniDoctor from "@/assets/chandini.webp";
import roliDoctor from "@/assets/Roli Singh.webp";
import allaboutDoctor from "@/assets/ManjuSangeetha.webp";
import niranjanDoctor from "@/assets/niranjan-doctor.webp";
import mjbDoctor from "@/assets/mjb-doctor.webp";
import rajDoctor from "@/assets/raj-doctor1.webp";
import srikrishnaDoctor from "@/assets/srikrishna-doctor.webp";
import mydentistDoctor from "@/assets/mydentist-doctor.webp";
import curaDoctor from "@/assets/cura-doctor.webp";
import rubyDoctor from "@/assets/ruby-doctor.webp";
import toothcornerDoctor from "@/assets/toothcorner-doctor.webp";
import toothtalesDoctor from "@/assets/toothtales-doctor.webp";
import toothlifeBanner from "@/assets/toothlife-banner.webp";
import drraobanner from "@/assets/drrao-banner.webp";
import prakashDoctor from "@/assets/prakash-doctor.webp";
import citysmileDoctor from "@/assets/citysmile-doctor.webp";
import chaitanaDoctor from "@/assets/chaitana-logo.webp";
import ecityDoctor from "@/assets/ecity-doctor.webp";
import dentaldecodeDoctor from "@/assets/dentaldecode-doctor.webp";
import careAndCureBanner from "../../assets/careAndCure-logo.webp";
import sculpturaDoctor from "@/assets/sculptura-doctor.webp";
import smileDentalDoctor from "@/assets/smileDentalDoctor.webp";
import whitePearlsDoctor from "@/assets/white-pearls-doctor.webp";
import sailajaDoctor from "@/assets/sailajaDoctor.webp";
import maDentalDoctor from "@/assets/maDentalDoctor.webp";
import toothCompertsDoctor from "@/assets/toothComfertsDoctor.webp";
import ayeshaDentalDoctor from "@/assets/ayeshaDentalDoctor.webp";
import latahDoctor from "@/assets/lathaDoctor.webp";

export const Route = createFileRoute("/clinics/")({
  component: ClinicsPage,
});

const locations = ["All", "Bengaluru", "Hyderabad", "Andhra Pradesh"];
export const clinics = [
  {
    name: "Jas Dental",
    slug: "jas-dental",
    location: "HSR Layout, Bengaluru",
    email: "jasaesthetic@gmail.com",
    whatsapp: "9591111177",
    logo: bashaDoctor,
  },
  {
    name: "Excel Dental",
    slug: "excel-dental",
    location: "JP Nagar 7th Phase, Bengaluru",
    email: "riz.zinu7@gmail.com",
    whatsapp: "8792801460",
    logo: rizwanaDoctor,
  },
  {
    name: "Girish Dental Clinic",
    slug: "girish-dental",
    location: "Wilson Garden, Bangalore",
    email: "enharishkumar@gmail.com",
    whatsapp: "9845988184",
    logo: girishDoctor,
  },
  {
    name: "Tooth Align Clinic",
    slug: "tooth-align-clinic",
    location: "HSR Layout, Bengaluru",
    email: "drharithatoothalign@gmail.com",
    whatsapp: "9398753235",
    logo: harithaDoctor,
  },
  {
    name: "House Of Teeth",
    slug: "house-of-teeth",
    location: "Singasandra, Bangalore",
    email: "houseofteeth888@gmail.com",
    whatsapp: "8105189978",
    logo: chandiniDoctor,
  },
  {
    name: "Makers Of Smile",
    slug: "makers-of-smile",
    location: "Akshayanagar, Bengaluru",
    email: "contact@makersofsmile.com",
    whatsapp: "7349137242",
    logo: roliDoctor,
  },
  {
    name: "All About Teeth",
    slug: "all-about-teeth-dental-clinic",
    location: "Kadubeesanahalli, Bengaluru",
    email: "allaboutteethclinic@gmail.com",
    whatsapp: "8296343683",
    logo: allaboutDoctor,
  },
  {
    name: "Raj Dental Clinic and Implant Center",
    slug: "raj-dental-clinic",
    location: "Malleshwaram, Bengaluru",
    email: "anushyb5@gmail.com",
    whatsapp: "7618704189",
    logo: rajDoctor,
  },
  {
    name: "Sri Krishna Dental Health Care",
    slug: "sri-krishna-dental-health-care",
    location: "Uttarahalli, Bengaluru",
    email: "drchandan.skdhc@gmail.com",
    whatsapp: "9113997388",
    logo: srikrishnaDoctor,
  },
  {
    name: "DR Rao's Multispeciality Dental Clinic",
    slug: "dr-raos-multispeciality-dental-clinic",
    location: "HSR Layout, Bengaluru",
    email: "drhanumantharao5@gmail.com",
    whatsapp: "9008159445",
    logo: drraobanner,
  },
  {
    name: "My Dentist",
    slug: "my-dentist-clinic",
    location: "Neelasandra, Bengaluru",
    email: "wikharuddin@gmail.com",
    whatsapp: "7019551416",
    logo: mydentistDoctor,
  },
  {
    name: "Cura Dental Clinic",
    slug: "cura-dental-clinic",
    location: "HSR Layout, Bengaluru",
    email: "curadentalindia@gmail.com",
    whatsapp: "8095303570",
    logo: curaDoctor,
  },
  {
    name: "Dr Ruby's Dental Care",
    slug: "dr-rubys-dental-care",
    location: "BTM 1st Stage, Bengaluru",
    email: "rubiena88@gmail.com",
    whatsapp: "8618513520",
    logo: rubyDoctor,
  },
  {
    name: "TOOTHLIFE",
    slug: "toothlife-clinic",
    location: "Haralur, Bengaluru",
    email: "toothlife23@gmail.com",
    whatsapp: "8217707232",
    logo: toothlifeBanner,
  },
  {
    name: "The Tooth Corner",
    slug: "the-tooth-corner",
    location: "Bellandur, Bengaluru",
    email: "thetoothcornerdental@gmail.com",
    whatsapp: "8008816763",
    logo: toothcornerDoctor,
  },
  {
    name: "Tooth Tales",
    slug: "tooth-tales",
    location: "Arekere, Bengaluru",
    email: "aryachandran163@gmail.com",
    whatsapp: "7026935371",
    logo: toothtalesDoctor,
  },
  {
    name: "Niranjan's Dental",
    slug: "niranjans-dental",
    location: "Jubilee Hills, Hyderabad",
    email: "niranjandentalclinic123@gmail.com",
    whatsapp: "9347196066",
    logo: niranjanDoctor,
  },
  {
    name: "MJB Dental Clinic",
    slug: "mjb-dental-clinic",
    location: "Yousufguda, Hyderabad",
    email: "mjbdentist@gmail.com",
    whatsapp: "9885778820",
    logo: mjbDoctor,
  },
  {
    name: "PRAKASH DENTAL HOSPITAL",
    slug: "prakash-dental-hospital",
    location: "Guntakal, Andhra Pradesh",
    logo: prakashDoctor,
    email: "drkakarlaprakash@gmail.com",
    whatsapp: "9848373504",
  },
  {
    name: "City Smiles Dental Clinic",
    slug: "city-smiles-dental-clinic",
    location: "Akshayanagar, Bengaluru",
    email: "citysmilesdental32@gmail.com",
    whatsapp: "7619224720",
    logo: citysmileDoctor,
  },
  {
    name: "Dr Chaitana’s Dental Care",
    slug: "dr-chaitana-dental-care",
    location: "Electronic City Phase 1, Bengaluru",
    email: "drchaitanasdentalcare@gmail.com",
    whatsapp: "7353190690",
    logo: chaitanaDoctor,
  },

  {
    name: "E City Dental",
    slug: "e-city-dental",
    location: "Electronic City, Bengaluru",
    email: "teamecitydental@gmail.com",
    whatsapp: "9945529816",
    logo: ecityDoctor,
  },

  {
    name: "Dental Decodé",
    slug: "dental-decode",
    location: "Rayasandra, Bengaluru",
    email: "dentaldecode.in@gmail.com",
    whatsapp: "9148164187",
    logo: dentaldecodeDoctor,
  },
  {
    name: "Care and Cure Dental Clinic",
    slug: "care-and-cure-dental-clinic",
    location: "Electronic City, Bengaluru",
    email: "drshameemunisham@gmail.com",
    whatsapp: "9916299690",
    logo: careAndCureBanner,
  },
  {
    name: "Sculptura Aesthetic Centre",
    slug: "sculptura-aesthetic-centre",
    location: "Jayanagar, Bengaluru",
    email: "prafullayogish@gmail.com",
    whatsapp: "9448933330",
    logo: sculpturaDoctor,
  },
  {
    name: "Smile Dental Care",
    slug: "smile-dental-care",
    location: "Shantipura, Electronic City, Bengaluru",
    email: "dr.aparna.sdc@gmail.com",
    whatsapp: "8123044110",
    logo: smileDentalDoctor,
  },
  {
    name: "Dr Neethu's White Pearls Multispeciality Dental Clinic",
    slug: "white-pearls-multispeciality-dental-clinic",
    location: "Hullahalli, Begur, Bengaluru",
    email: "whitepearlsmultispeciality@gmail.com",
    whatsapp: "7483981229",
    logo: whitePearlsDoctor,
  },
  {
    name: "Smile Dental Clinic",
    slug: "smile-dental-clinic-arekere",
    location: "Arekere, Bannerghatta Road, Bengaluru",
    email: "dr.shilubds@gmail.com",
    whatsapp: "9148630602",
    logo: sailajaDoctor,
  },
  {
    name: "MA Dental",
    slug: "ma-dental-piler",
    location: "Kotapalli Circle, Piler, Andhra Pradesh",
    email: "dr.bhanu4all@gmail.com",
    whatsapp: "9515299307",
    logo: maDentalDoctor,
  },
  {
    name: "Tooth Comforts",
    slug: "tooth-comforts",
    location: "Uttarahalli, Bengaluru, Karnataka",
    email: "haridrshri@gmail.com",
    whatsapp: "9886373263",
    logo: toothCompertsDoctor,
  },
  {
    name: "Ayesha Dental Clinic",
    slug: "ayesha-dental-clinic",
    location: "Bommanahalli, Bengaluru",
    email: "modinnadaf061974@gmail.com",
    whatsapp: "9342235245",
    logo: ayeshaDentalDoctor,
  },
  {
    name: "Latha Dental Care Centre",
    slug: "latha-dental-care-centre",
    location: "BTM 1st Stage, Bengaluru",
    email: "lathagldc@gmail.com",
    whatsapp: "9731107222",
    logo: latahDoctor,
  },
];

function ClinicsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All");

  const filteredClinics =
    selectedLocation === "All"
      ? clinics
      : clinics.filter((clinic) => {
          if (selectedLocation === "Bengaluru") {
            return clinic.location.includes("Bengaluru") || clinic.location.includes("Bangalore");
          }

          if (selectedLocation === "Hyderabad") {
            return clinic.location.includes("Hyderabad");
          }

          if (selectedLocation === "Andhra Pradesh") {
            return clinic.location.includes("Andhra Pradesh");
          }

          return true;
        });

  return (
    <section className="min-h-screen pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-4">Our Partner Clinics</h1>

        <p className="text-center text-gray-600 mb-4">
          Trusted Dental Clinics Associated With 3D Digital Dental Designers
        </p>

        <p className="text-center text-sm text-gray-500 mb-10">
          {filteredClinics.length} Clinics Found
        </p>

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 mb-10">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => setSelectedLocation(location)}
              className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                selectedLocation === location
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {location}
            </button>
          ))}
        </div>

        {/* Mobile Filter */}
        <div className="md:hidden mb-8">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full rounded-xl border p-3"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredClinics.map((clinic) => (
            <Link
              key={clinic.slug}
              to={`/clinics/${clinic.slug}`}
              className="bg-white rounded-3xl border shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-80 bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
                <img
                  src={clinic.logo}
                  alt={clinic.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{clinic.name}</h3>

                <p className="text-gray-500 text-sm">📍 {clinic.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
