import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db";
import Clinic from "./models/Clinic";

const clinics = [
  {
    name: "Jas Dental",
    address: "HSR Layout, Bengaluru",
    latitude: 12.920264,
    longitude: 77.643721,
    phone: "+91 9591111177",
  },
  {
    name: "Excel Dental",
    address: "JP Nagar 7th Phase, Bengaluru",
    latitude: 12.889791,
    longitude: 77.586101,
    phone: "+91 8792801460",
  },
  {
    name: "Girish Dental Clinic",
    address: "Wilson Garden, Bangalore",
    latitude: 12.945233,
    longitude: 77.594378,
    phone: "+91 9845988184",
  },
  {
    name: "Tooth Align Clinic",
    address: "HSR Layout, Bengaluru",
    latitude: 12.894651,
    longitude: 77.611997,
    phone: "+91 9398753235",
  },
  {
    name: "House Of Teeth",
    address: "Singasandra, Bangalore",
    latitude: 12.884874,
    longitude: 77.640394,
    phone: "+91 8105189978",
  },
  {
    name: "Makers Of Smile",
    address: "Akshayanagar, Bengaluru",
    latitude: 12.867432,
    longitude: 77.618301,
    phone: "+91 7349137242",
  },
  {
    name: "Dr Chaitana's Dental Care",
    address: "Electronic City Phase 1, Bengaluru",
    latitude: 12.861,
    longitude: 77.677,
    phone: "+91 7353190690",
  },
  {
    name: "E City Dental",
    address: "Electronic City, Bengaluru",
    latitude: 12.845,
    longitude: 77.661,
    phone: "+91 9945529816",
  },
  {
    name: "All About Teeth",
    address: "Kadubeesanahalli, Bengaluru",
    latitude: 12.93,
    longitude: 77.686,
    phone: "+91 8296343683",
  },
  {
    name: "Niranjan's Dental",
    address: "Jubilee Hills, Hyderabad",
    latitude: 17.432,
    longitude: 78.408,
    phone: "+91 9347196066",
  },
  {
    name: "MJB Dental Clinic",
    address: "Yousufguda, Hyderabad",
    latitude: 17.429,
    longitude: 78.427,
    phone: "+91 9885778820",
  },
  {
    name: "Raj Dental Clinic and Implant Center",
    address: "Malleshwaram, Bengaluru",
    latitude: 12.999533,
    longitude: 77.570621,
    phone: "+91 7618704189",
  },
  {
    name: "Sri Krishna Dental Health Care",
    address: "Uttarahalli, Bengaluru",
    latitude: 12.905643,
    longitude: 77.540331,
    phone: "+91 9113997388",
  },
  {
    name: "DR Rao's Multispeciality Dental Clinic",
    address: "HSR Layout, Bengaluru",
    latitude: 12.919427,
    longitude: 77.644118,
    phone: "+91 9008159445",
  },
  {
    name: "My Dentist",
    address: "Neelasandra, Bengaluru",
    latitude: 12.954389,
    longitude: 77.613175,
    phone: "+91 7019551416",
  },
  {
    name: "Cura Dental Clinic",
    address: "HSR Layout, Bengaluru",
    latitude: 12.912399,
    longitude: 77.637718,
    phone: "+91 8095303570",
  },
  {
    name: "Dr Ruby's Dental Care",
    address: "BTM 1st Stage, Bengaluru",
    latitude: 12.919864,
    longitude: 77.60826,
    phone: "+91 8618513520",
  },
  {
    name: "TOOTHLIFE",
    address: "Haralur, Bengaluru",
    latitude: 12.899046,
    longitude: 77.656174,
    phone: "+91 8217707232",
  },
  {
    name: "The Tooth Corner",
    address: "Bellandur, Bengaluru",
    latitude: 12.927339,
    longitude: 77.66087,
    phone: "+91 8008816763",
  },
  {
    name: "Tooth Tales",
    address: "Arekere, Bengaluru",
    latitude: 12.883524,
    longitude: 77.604334,
    phone: "+91 7026935371",
  },
  {
    name: "PRAKASH DENTAL HOSPITAL",
    address: "Guntakal, Andhra Pradesh",
    latitude: 15.167,
    longitude: 77.383,
    phone: "+91 9848373504",
  },
  {
    name: "City Smiles Dental Clinic",
    address: "Akshayanagar, Bengaluru",
    latitude: 12.867,
    longitude: 77.618,
    phone: "+91 7619224720",
  },
  {
    name: "Dental Decodé",
    address: "Rayasandra, Bengaluru",
    latitude: 12.852,
    longitude: 77.682,
    phone: "+91 9148164187",
  },
  {
    name: "Care and Cure Dental Clinic",
    address: "Electronic City, Bengaluru",
    latitude: 12.858,
    longitude: 77.671,
    phone: "+91 9916299690",
  },
  {
    name: "Sculptura Aesthetic Centre",
    address: "Jayanagar, Bengaluru",
    latitude: 12.919437,
    longitude: 77.580159,
    phone: "+91 9448933330",
  },
  {
    name: "Smile Dental Care",
    address: "Electronic City, Bengaluru",
    latitude: 12.846832,
    longitude: 77.679756,
    phone: "+91 8123044110",
  },
  {
    name: "Dr Neethu's White Pearls",
    address: "Hullahalli, Begur, Bengaluru",
    latitude: 12.828376,
    longitude: 77.620778,
    phone: "+91 7483981229",
  },
  {
    name: "Smile Dental Clinic",
    address: "Arekere, Bengaluru",
    latitude: 12.886588,
    longitude: 77.587053,
    phone: "+91 9148630602",
  },
  {
    name: "MA Dental",
    address: "Piler, Andhra Pradesh",
    latitude: 13.617304,
    longitude: 78.570909,
    phone: "+91 9515299307",
  },
];

async function seed() {
  try {
    await connectDB();

    await Clinic.deleteMany({});

    await Clinic.insertMany(clinics);

    console.log(`✅ ${clinics.length} clinics inserted`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();