import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { matriksSkillChangeRequestsAPI } from "../services/api";
import api from "../services/api";

const DEPARTMENTS_DATA = [
    {
        id: "quality-assurance",
        name: "Quality Assurance",
        color: "bg-blue-500",
        borderColor: "#005beeff",
        iconColor: "#005beeff",
        matriksData: {
            judul: "MATRIKS KOMPETENSI",
            divisi: "Quality Assurance",
            departemen: "Quality Assurance",
            tglEfektif: "7 Februari 2025",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23220025", nama: "M BAGUS SANTOSO", jabatan: "QA DEPARTMENT", bagian: "Quality Assurance", kompetensiValues: [3, 3, 3, 4, 4, 3, 3, 4, 4, 4, 4, null, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null], standarKompetensi: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23050023", nama: "DWI PURWANTO", jabatan: "QUALITY ASSURANCE PROCESS", bagian: "Quality Assurance", kompetensiValues: [3, 3, 3, 4, 4, 3, 3, 4, 4, 4, 4, null, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null], standarKompetensi: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], metodeFulfillment: [null, null, "OJD", "OJD", null, "OJD", null, null, "OJD", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23050023", nama: "SUCI PURWANTO", jabatan: "QUALITY ASSURANCE PROCESS", bagian: "Quality Assurance", kompetensiValues: [3, 3, 3, 4, 4, 3, 3, 4, 4, 4, 4, null, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null], standarKompetensi: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], metodeFulfillment: [null, null, null, null, "OJD", null, "OJD", null, null, "OJD", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23160477", nama: "NURDIANTO", jabatan: "LAB & KALIBRASI", bagian: "Quality Assurance", kompetensiValues: [3, 3, 3, 4, 3, 3, null, null, null, 3, 3, null, null, null, 3, 3, 3, 3, 3, 3, 3, null, null, null, 3, null, null], standarKompetensi: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], metodeFulfillment: [null, null, null, null, null, "OJD", "OJD", "OJD", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23120140", nama: "CANDRA MAULANA", jabatan: "CLAIM & COMPLAIN", bagian: "Quality Assurance", kompetensiValues: [3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, null, null, null, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, null, null], standarKompetensi: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], metodeFulfillment: ["OJD", null, null, null, null, "OJD", "OJD", null, "OJD", "OJD", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], scheduleFulfillment: Array(27).fill(null) },
            ],
        }
    },
    {
        id: "management-representative",
        name: "Management Representative",
        color: "bg-green-500",
        borderColor: "#22c55e",
        iconColor: "#22c55e",
        matriksData: {
            judul: "MATRIKS KOMPETENSI",
            divisi: "Management Representative",
            departemen: "Management Representative",
            tglEfektif: "7 Februari 2025",
            kompetensi: ["Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",],
            karyawan: [
                { no: 1, npk: "23600041", nama: "SUGIYARTO", jabatan: "MANAGEMENT REPRESENTATIVE", bagian: "Management Representative", kompetensiValues: [4, 3, 3, 4, 4], standarKompetensi: [2, 2, 2, 2, 2], metodeFulfillment: Array(5).fill(null), scheduleFulfillment: Array(5).fill(null) },
                { no: 2, npk: "23240175", nama: "BOBI SAPUTRA", jabatan: "MANAGEMENT REPRESENTATIVE", bagian: "Management Representative", kompetensiValues: [4, 3, 3, 4, 4], standarKompetensi: [2, 2, 2, 2, 2], metodeFulfillment: Array(5).fill(null), scheduleFulfillment: Array(5).fill(null) },
            ],
        },
    },
    {
        id: "finance",
        name: "Finance",
        color: "bg-yellow-500",
        borderColor: "#eab308",
        iconColor: "#eab308",
        matriksData: {
            judul: "MATRIKS KOMPETENSI",
            divisi: "Finance",
            departemen: "Finance",
            tglEfektif: "7 Februari 2025",
            kompetensi: ["Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",],
            karyawan: [
                { no: 1, npk: "23220017", nama: "YULIUS PERMATA", jabatan: "FINANCE & ACCOUNTING", bagian: "Finance", kompetensiValues: [3, 4, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(4).fill(null), scheduleFulfillment: Array(4).fill(null) },
                { no: 2, npk: "23060055", nama: "FAKHDARENI", jabatan: "FINANCE & ACCOUNTING", bagian: "Finance", kompetensiValues: [3, 4, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(4).fill(null), scheduleFulfillment: Array(4).fill(null) },
                { no: 3, npk: "23170572", nama: "KHOIRUNISA", jabatan: "FINANCE & ACCOUNTING", bagian: "Finance", kompetensiValues: [3, 4, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(4).fill(null), scheduleFulfillment: Array(4).fill(null) },
                { no: 4, npk: "23120177", nama: "SITI ROKHAYATI", jabatan: "FINANCE & ACCOUNTING", bagian: "Finance", kompetensiValues: [3, 4, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(4).fill(null), scheduleFulfillment: Array(4).fill(null) },
                { no: 5, npk: "23120198", nama: "ANNISA NUR HANDAYANI", jabatan: "FINANCE & ACCOUNTING", bagian: "Finance", kompetensiValues: [3, 4, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(4).fill(null), scheduleFulfillment: Array(4).fill(null) },
            ],
        },
    },
    {
        id: "hrga-it",
        name: "HRGA & IT",
        color: "bg-purple-500",
        borderColor: "#a855f7",
        iconColor: "#a855f7",
        matriksData: {
            judul: "MATRIKS KOMPETENSI",
            divisi: "HRGA & IT",
            departemen: "HRGA & IT",
            tglEfektif: "7 Februari 2025",
            kompetensi: ["Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",],
            karyawan: [
                { no: 1, npk: "23060056", nama: "DIKI WAHYUDI", jabatan: "HRGA & IT", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23240206", nama: "VERONICA HANI M.", jabatan: "HRGA & IT", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23230072", nama: "THARISA ARRAHMA R.", jabatan: "HRD", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23120131", nama: "SUPRIADI", jabatan: "GENERAL AFFAIR & IND. RELATIONS", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23110116", nama: "PARTINI LUPI", jabatan: "GENERAL AFFAIR & IND. RELATIONS", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 6, npk: "23120158", nama: "MIMBARYANTO", jabatan: "GENERAL AFFAIR & IND. RELATIONS", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 7, npk: "23070074", nama: "ROZIQIN", jabatan: "INFORMATION TECHNOLOGY", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 8, npk: "23220040", nama: "FARHANSYAH A.L", jabatan: "INFORMATION TECHNOLOGY", bagian: "HRGA & IT", kompetensiValues: [4, 3, 3, 4], standarKompetensi: [2, 2, 2, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ],
        },
    },
    {
        id: "management-development",
        name: "Management Development",
        color: "bg-red-500",
        borderColor: "#ff2929ff",
        iconColor: "#ff2929ff",
        matriksData: {
            judul: "MATRIKS KOMPETENSI",
            divisi: "MANAGEMENT DEVELOPMENT",
            departemen: "MANAGEMENT DEVELOPMENT",
            tglEfektif: "7 Februari 2025",
            kompetensi: ["Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",],
            karyawan: [
                { no: 1, npk: "23230114", nama: "KARNA SATIA SALIM", jabatan: "MANAGEMENT DEVELOPMENT/PDCA", bagian: "MANAGEMENT DEVELOPMENT", kompetensiValues: [2, 2, 2, 3, 3, 4], standarKompetensi: [1, 2, 4, 2], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23240175", nama: "WAHYU KARTIKO ADI", jabatan: "MANAGEMENT DEVELOPMENT/PDCA", bagian: "MANAGEMENT DEVELOPMENT", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ]
        }
    },
    {
        id: "manufactur-battery",
        name: "Manufacturing Battery",
        color: "bg-gray-500",
        borderColor: "#a9a3a3ff",
        iconColor: "#a9a3a3ff",
        matriksData: {
            judul: "MATRIKS KOMPETENSI",
            divisi: "MANUFACTURING BATTERY",
            departemen: "MANUFACTURING BATTERY",
            tglEfektif: "7 Februari 2025",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23220105", nama: "DIONISIUS AUGUSTO", jabatan: "BATTERY PRODUCTION & PME", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23230135", nama: "YEREMIA SOTYA", jabatan: "BATTERY PRODUCTION", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23190805", nama: "ASEP AGUNG WIGUNA", jabatan: "BATTERY PRODUCTION", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23230091", nama: "ADHITYA SATIAWA SUYADATA", jabatan: "QUALITY ASSURANCE", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23230055", nama: "RIZAL GUNAWAN", jabatan: "AUXILIARY BATTERY PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 6, npk: "23120193", nama: "MUH. NANDER", jabatan: "AUXILIARY BATTERY PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 7, npk: "23120145", nama: "GANTIANTO", jabatan: "AUXILIARY BATTERY PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 8, npk: "23120184", nama: "TARMUDIN", jabatan: "AUXILIARY BATTERY PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 9, npk: "23110110", nama: "DEDI SUKMA", jabatan: "AUXILIARY BATTERY PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 10, npk: "23230015", nama: "EKO DAMAR WAHYUDI", jabatan: "BESS PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 11, npk: "23120197", nama: "WIDODO", jabatan: "BESS PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 12, npk: "23110119", nama: "SUPRIYONO", jabatan: "BESS PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 13, npk: "23240229", nama: "PUTRI LESTARI", jabatan: "BESS PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 14, npk: "23210079", nama: "RIZIQ RIDWAN", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 15, npk: "23230053", nama: "AINA WAKHORIDAH", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 16, npk: "23230054", nama: "DENDI SETIAWAN", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 17, npk: "23230116", nama: "GALIH SOMAT", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 18, npk: "23120192", nama: "M. YUNUS ARIFAI", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 19, npk: "23120161", nama: "DODIK", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 20, npk: "23120199", nama: "NACA RODIANA HENDRAYANA", jabatan: "BEV PRODUCT", bagian: "Manufacturing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ]
        }
    },
    {
        id: "manufacturing-cable",
        name: "Manufacturing Cable",
        color: "bg-orange-500",
        borderColor: "#fc8600ff",
        iconColor: "#fc8600ff",
        matriksData: {
            judul: "Matriks Kompetensi",
            divisi: "Manufacturing Cable",
            departemen: "Manufacturing Cable",
            tglEfektif: "7 Februari 2026",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23230114", nama: "KARNA SATIA SALIM", jabatan: "CONTROLCABLE MANUFACTURE", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23060049", nama: "DADI ROSADI", jabatan: "MANUFACTURING UNIT", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23050024", nama: "M. SUGIARTO", jabatan: "ASSEMBLING UNIT", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23110109", nama: "CHOIRUL AMIN", jabatan: "PRODUCTION ENGINEERING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23120156", nama: "AGUS PURWANTORO", jabatan: "GROUP CO & CI", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 6, npk: "23120156", nama: "AJI BABAN", jabatan: "GROUP CO & CI", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 7, npk: "23090089", nama: "MAYAR SANTOSO", jabatan: "GROUP PO", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 8, npk: "23110114", nama: "IWAN SUPRIYADI", jabatan: "GROUP PO", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 9, npk: "23110117", nama: "PIKI TAOFIK", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 10, npk: "23120132", nama: "DEDY IRWANSYAH", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 11, npk: "23070072", nama: "AGUNG BASUKI", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 12, npk: "23110122", nama: "YULIANTO", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 13, npk: "23110118", nama: "SOPAN", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 14, npk: "23120164", nama: "MUJIATI", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 15, npk: "23120165", nama: "HIDAYATUL", jabatan: "GROUP ASSEMBLING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 16, npk: "23110120", nama: "TRI YULIANTO", jabatan: "MAINTENANCE", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 17, npk: "23180703", nama: "AHMAD DAYU ZAINI", jabatan: "MAINTENANCE", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 18, npk: "23120155", nama: "HANA OKTA", jabatan: "PRODUCTION ENGINEERING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 19, npk: "23120137", nama: "SUGIHARTO", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 20, npk: "23060047", nama: "CIPTO RAHMAT SASONO", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 21, npk: "23120146", nama: "DENDI SETYAWAN", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 22, npk: "23120138", nama: "HERI MOHAMMAD AFANDI", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 23, npk: "23110113", nama: "INDRI NOVITA SARI", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 24, npk: "23120140", nama: "PARTO", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 25, npk: "23090091", nama: "SUPANTO", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 26, npk: "23110121", nama: "WANTO", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 27, npk: "23120154", nama: "JUPRI SAHALA", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 28, npk: "23120219", nama: "ARIYANTO", jabatan: "QUALITY CONTROL PROCESS", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 29, npk: "23220078", nama: "MAULANA MALIK IBRAHIM", jabatan: "QUALITY CONTROL INCOMING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 30, npk: "23120181", nama: "MOH. NURHIDAYAT", jabatan: "QUALITY CONTROL INCOMING", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 31, npk: "23120191", nama: "DWI WIDYASTUTI", jabatan: "ADMINISTRATION", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 32, npk: "23230008", nama: "MELINDA SURYANI HASIBUAN", jabatan: "ADMINISTRATION", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 33, npk: "23120217", nama: "RIRIN ERLINA", jabatan: "ADMINISTRATION", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 34, npk: "23230027", nama: "ANDI PUTRA MALBA SYAGGAF", jabatan: "ADMINISTRATION", bagian: "Manufacturing Cable", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ]
        }
    },
    {
        id: "Marketing Battery",
        name: "Marketing Battery",
        color: "bg-green-500",
        borderColor: "#36f003ff",
        iconColor: "#36f003ff",
        matriksData: {
            judul: "Matriks Kompetensi",
            divisi: "Marketing Battery",
            departemen: "Marketing Battery",
            tglEfektif: "7 Februari 2026",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23200067", nama: "RENDRA PRAMONO", jabatan: "MARKETING BATTERY", bagian: "Marketing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23240177", nama: "CHRYSNA YULIAWAN", jabatan: "AUX & POWER BATTERY MARKETING", bagian: "Marketing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23220049", nama: "FERDINAND STEVANUS A", jabatan: "ESS MARKETING", bagian: "Marketing Battery", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ]
        }
    },
    {
        id: "marketing-engineering",
        name: "Marketing Engineering",
        color: "bg-pink-500",
        borderColor: "#ff008cff",
        iconColor: "#ff008cff",
        matriksData: {
            judul: "Matriks Kompetensi",
            divisi: "Marketing Engineering",
            departemen: "Marketing Engineering",
            tglEfektif: "7 Februari 2026",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23040119", nama: "ANDREAS AGUNG S", jabatan: "MARKETING ENGINEERING", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23130254", nama: "SAVITRI OCTAVIANI", jabatan: "SALES & MARKETING CONTROLCABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23060041", nama: "SUGIYARTO", jabatan: "ENGINEERING CONTROLCABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23110101", nama: "RIKA TRI HARMELIA", jabatan: "SALES & MARKETING CONTROLCABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23230110", nama: "KHANSA  Z.H", jabatan: "SALES & MARKETING CONTROLCABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 6, npk: "23030015", nama: "SUMIYARTO", jabatan: "CUSTOMER REPRESENTATIVE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 7, npk: "23120160", nama: "NUR DWI WAHYONO", jabatan: "PRODUCT & QUALITY ENGINEERING CABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 8, npk: "23190773", nama: "ALIF PRIATNA", jabatan: "PRODUCT & QUALITY ENGINEERING CABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 9, npk: "23240228", nama: "ANNISA SEPTIYANING CHOIR", jabatan: "PRODUCT & QUALITY ENGINEERING CABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 10, npk: "23190727", nama: "MUHAMMAD SYARIFUDIN", jabatan: "PROCESS ENGINEERING CABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 11, npk: "23240227", nama: "AHMAD JAELANI SIDIK", jabatan: "PROCESS ENGINEERING CABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 12, npk: "23120143", nama: "DEDI SETIADI", jabatan: "PROCESS ENGINEERING CABLE", bagian: "Marketing Engineering", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ]
        }
    },
    {
        id: "mi-she",
        name: "MI SHE",
        color: "bg-yellow-500",
        borderColor: "#eaff00ff",
        iconColor: "#eaff00ff",
        matriksData: {
            judul: "Matriks Kompetensi",
            divisi: "MI SHE",
            departemen: "MI SHE",
            tglEfektif: "7 Februari 2026",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23190806", nama: "ELIATA DUMAR GINTING", jabatan: "MI & SHE (5R-SMK3-ISO 14001)", bagian: "MI SHE", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23240175", nama: "BOBI SAPUTRA", jabatan: "MI", bagian: "MI SHE", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23230122", nama: "AFKA FIKRI AIMAN", jabatan: "SHE (5R-SMK3-ISO 14001)", bagian: "MI SHE", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23090096", nama: "TARJO", jabatan: "SHE (5R-SMK3-ISO 14001)", bagian: "MI SHE", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23120171", nama: "ZEL UWEYS A", jabatan: "SHE (5R-SMK3-ISO 14001)", bagian: "MI SHE", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },

            ]
        }
    },
    {
        id: "ppic",
        name: "PPIC",
        color: "bg-blue-500",
        borderColor: "#00ffd0ff",
        iconColor: "#00ffd0ff",
        matriksData: {
            judul: "Matriks Kompetensi",
            divisi: "PPIC",
            departemen: "PPIC",
            tglEfektif: "7 Februari 2026",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23060056", nama: "DIKI WAHYUDI", jabatan: "PPIC", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23090093", nama: "ADE AKHMAD FAUZI", jabatan: "PPC CONTROLCABLE", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23120159", nama: "BUCHORI", jabatan: "BATTERY & AHM OES", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23080082", nama: "ANANG SUTAMTOMO", jabatan: "WHS CONTROLCABLE", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23090090", nama: "SETIYONO", jabatan: "CONTROLCABLE", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 6, npk: "23070073", nama: "ERLI SULIANTO", jabatan: "PROD PLAN", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 7, npk: "23110111", nama: "EFRAIN TAMBUNAN", jabatan: "DN/MANIFEST", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 8, npk: "23120151", nama: "SUDARMANTO", jabatan: "DELIVERY", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 9, npk: "231202130", nama: "SRI NATIN", jabatan: "BATTERY", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 10, npk: "23120174", nama: "H. HANAM MUCHLISIN", jabatan: "BATTERY STAFF", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 11, npk: "23120190", nama: "SULASTRI", jabatan: "SUPPLIER CONTROL", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 12, npk: "23120196", nama: "LAILA FITRIYAH", jabatan: "MRP", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 13, npk: "23120153", nama: "SUPRIYANTO", jabatan: "RM & OHP", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 14, npk: "23120154", nama: "RAGIL PAMUNGKAS", jabatan: "RM & OHP", bagian: "PPIC", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },

            ]
        }
    },
    {
        id: "purchasing",
        name: "Purchasing",
        color: "bg-gray-500",
        borderColor: "#009dffff",
        iconColor: "#009dffff",
        matriksData: {
            judul: "Matriks Kompetensi",
            divisi: "Purchasing",
            departemen: "Purchasing",
            tglEfektif: "7 Februari 2026",
            kompetensi: [
                "Alat Ukur",
                "Membaca Gambar",
                "Standar Quality Product",
                "Hood Lock (BZ230, BZ240, BZ350, BZ330, BZD30, BZ070)",
                "Cable Assy Back Door (D80,D38 D21)",
                "Fuel Lid (D88, D30, D21)",
                "Fuel Lid D72",
                "Fuel Lid D55",
                "Fuel Lid D26",
                "Luggage (OD 450, 430, 490)",
                "Fuel Lid ( K-00 & K-10 )",
                "Throttle K1-AA ( A & B )",
                "Throttle K2S ( A & B )",
                "Choke (KVR, KFL, KVY)",
                "Speedometer (All type)",
                "Seat Lock ( K2S )",
                "Clutch K45- (N40,N00)",
                "Seat Lock (K41, K59, KZR,K15)",
                "Seat Lock K97,K0JA,K0WA",
                "Fuel Lid K97",
                "Front Brake (K60, K93, K60R, K1A-N11, K1A-N21, K1A-N91)",
                "Rear Brake (K81, KVB)",
                "Rear Brake (K60, K93),K0JA",
                "Rear Brake (K1A-N11, K1A-N21, K1A-N91)",
                "VISUAL FRONT BRAKE (K60R,K93,K1A-N11,K1A-N21)",
                "Cable Assy, Parking Brake, LH (59760-16800)",
                "Cable Assy, Parking Brake, RH (59770-16800)",
            ],
            karyawan: [
                { no: 1, npk: "23060056", nama: "DIKI WAHYUDI", jabatan: "PROCUREMENT & PURCHASING", bagian: "Purchasing", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 2, npk: "23060055", nama: "FAKHDARENI", jabatan: "PROCUREMENT & PURCHASING", bagian: "Purchasing", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 3, npk: "23230017", nama: "RIFQI FATHAH", jabatan: "CONTROLCABLE", bagian: "Purchasing", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 4, npk: "23250234", nama: "MARCHELINO DWI PUTRANTO", jabatan: "BATTERY", bagian: "Purchasing", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 5, npk: "23220060", nama: "SYIFA NUR MULYANI", jabatan: "GENERAL & LEGAL", bagian: "Purchasing", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
                { no: 6, npk: "23110112", nama: "ELITRI SULISTIYO", jabatan: "SUBCONT", bagian: "Purchasing", kompetensiValues: [], standarKompetensi: [], metodeFulfillment: Array(27).fill(null), scheduleFulfillment: Array(27).fill(null) },
            ]
        }
    }
]

const calcAverage = (vals) => {
    const v = (vals || []).filter((x) => x !== null && x !== undefined);
    if (!v.length) return "-";
    return (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2);
};

const PieChart = ({ value }) => {
    if (!value || isNaN(value)) return <span style={{ fontSize: 9, color: "#9ca3af" }}>-</span>;

    const numValue = parseFloat(value);
    const percentage = (numValue / 4) * 100;


    const getColor = (val) => {
        if (val >= 3.5) return "#22c55e";
        if (val >= 3.0) return "#84cc16";
        if (val >= 2.5) return "#fbbf24";
        if (val >= 2.0) return "#fb923c";
        return "#ef4444";
    };

    const color = getColor(numValue);
    const size = 32;
    const center = size / 2;
    const radius = size / 2 - 1;

    const angle = (percentage / 100) * 360;
    const radians = (angle - 90) * (Math.PI / 180);

    const x = center + radius * Math.cos(radians);
    const y = center + radius * Math.sin(radians);

    const largeArcFlag = angle > 180 ? 1 : 0;

    let path;
    if (percentage >= 100) {
        path = `M ${center},${center} m -${radius},0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    } else if (percentage > 0) {
        path = `M ${center},${center} L ${center},${center - radius} A ${radius},${radius} 0 ${largeArcFlag},1 ${x},${y} Z`;
    } else {
        path = '';
    }

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={size} height={size}>
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="#e5e7eb"
                />
                {path && (
                    <path
                        d={path}
                        fill={color}
                    />
                )}
            </svg>
        </div>
    );
};

const DocHeader = ({ data }) => (
    <div style={{ border: "1px solid #9ca3af", backgroundColor: "#fff", width: "100%" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #9ca3af" }}>

            {/* Logo */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRight: "1px solid #9ca3af",
                padding: "10px 16px",
                minWidth: "200px",
            }}>
                <img
                    src="/logo/dcci.png"
                    alt="PT DCI"
                    style={{ height: "56px", objectFit: "contain" }}
                    onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                    }}
                />
                <div style={{ display: "none", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        backgroundColor: "#1e3a8a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 4,
                    }}>
                        <span style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>DCI</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: "bold", color: "#1e3a8a", lineHeight: 1.2 }}>
                        PT DHARMA<br />CONTROLCABLE IND.
                    </span>
                </div>
            </div>

            {/* Judul tengah */}
            <div style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "10px 16px",
                borderRight: "1px solid #9ca3af",
            }}>
                <span style={{ fontSize: 18, fontWeight: "bold", letterSpacing: "0.05em", color: "#111827", textTransform: "uppercase" }}>
                    {data.judul}
                </span>
            </div>

            {/* Kotak Dibuat / Diperiksa / Disetujui */}
            {["DIBUAT", "DISETUJUI"].map((label, i) => (
                <div key={i} style={{
                    borderLeft: "1px solid #9ca3af",
                    width: "100px",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                }}>
                    <div style={{ borderBottom: "1px solid #9ca3af", padding: "4px 6px", textAlign: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: "bold", color: "#111827" }}>{label}</span>
                    </div>
                    <div style={{ flex: 1, minHeight: "60px" }} />
                    <div style={{ borderTop: "1px solid #9ca3af", padding: "3px 6px", textAlign: "center" }}>
                        <span style={{ fontSize: 7, color: "#6b7280" }}>Nama & Ttd</span>
                    </div>
                </div>
            ))}

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "none" }}>
            {[
                ["Divisi", data.divisi],
                ["Departemen", data.departemen],
                ["Tgl Efektif", data.tglEfektif],
            ].map(([label, value], i) => (
                <div
                    key={i}
                    style={{
                        padding: "6px 12px",
                        borderRight: i < 2 ? "1px solid #9ca3af" : "none",
                        fontSize: 12,
                    }}
                >
                    <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
                    <span style={{ color: "#6b7280" }}> : </span>
                    <span style={{ color: "#111827" }}>{value}</span>
                </div>
            ))}
        </div>
    </div>
);

const MatriksTable = ({ data, isEditMode, onEdit }) => {
    const headerBg = "#1f3864";
    const headerBg2 = "#2e4a7a";
    const headerText = "#ffffff";

    const thStyle = {
        border: "1px solid #6b7280",
        padding: "4px 3px",
        textAlign: "center",
        fontSize: 11,
        fontWeight: "bold",
        backgroundColor: headerBg,
        color: headerText,
        whiteSpace: "nowrap",
    };

    const tdFixed = {
        border: "1px solid #d1d5db",
        padding: "3px 5px",
        fontSize: 11,
        whiteSpace: "nowrap",
    };

    return (
        <div style={{ overflowX: "auto", marginTop: 0, width: "100%" }}>
            <style>{`
                .matriks-table {
                    border-collapse: collapse !important;
                }
                .matriks-table td,
                .matriks-table th {
                    border: 1px solid #d1d5db !important;
                    box-sizing: border-box !important;
                }
                .matriks-table td:empty,
                .matriks-table th:empty {
                    border: 1px solid #d1d5db !important;
                }
            `}</style>
            <table className="matriks-table" style={{ borderCollapse: "collapse", fontSize: 11, width: "100%", minWidth: "100%" }}>
                <thead>
                    <tr>
                        {[
                            { label: "No", minW: 32, rowSpan: 2 },
                            { label: "NPK", minW: 85, rowSpan: 2 },
                            { label: "NAMA", minW: 165, rowSpan: 2 },
                            { label: "JABATAN", minW: 110, rowSpan: 2 },
                            { label: "BAGIAN", minW: 130, rowSpan: 2 },
                            { label: "SK / K", minW: 120, rowSpan: 2 },
                        ].map(({ label, minW, rowSpan }) => (
                            <th key={label} rowSpan={rowSpan} style={{ ...thStyle, minWidth: minW, backgroundColor: "white", color: "#000000", verticalAlign: "middle" }}>
                                {label}
                            </th>
                        ))}
                        <th
                            colSpan={data.kompetensi.length}
                            style={{ ...thStyle, backgroundColor: "white", color: "#000000" }}
                        >
                            KOMPETENSI
                        </th>
                        <th rowSpan={2} style={{ ...thStyle, minWidth: 120, width: 120, backgroundColor: "white", color: "#000000", verticalAlign: "middle" }}>
                            Hasil<br />Kompetensi
                        </th>
                    </tr>

                    <tr>
                        {data.kompetensi.map((k, i) => (
                            <th
                                key={i}
                                style={{
                                    border: "1px solid #6b7280",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: 10,
                                    backgroundColor: "white",
                                    color: "#000000",
                                    writingMode: "vertical-rl",
                                    transform: "rotate(180deg)",
                                    minWidth: 34,
                                    maxWidth: 34,
                                    height: 130,
                                    verticalAlign: "bottom",
                                    padding: "4px 2px",
                                }}
                            >
                                {k}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.karyawan.map((kar, kIdx) => (
                        <React.Fragment key={kar.npk}>

                            {/* ── Baris 1: K (Kompetensi) ── */}
                            <tr>
                                {/* No */}
                                <td
                                    rowSpan={4}
                                    style={{ ...tdFixed, textAlign: "center", fontWeight: 600, backgroundColor: "white" }}
                                >
                                    {kar.no}
                                </td>
                                {/* NPK */}
                                <td rowSpan={4} style={{ ...tdFixed, backgroundColor: "white" }}>
                                    {isEditMode ? (
                                        <input
                                            style={{ width: "100%", border: "1px solid #93c5fd", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}
                                            value={kar.npk}
                                            onChange={(e) => onEdit(kIdx, "npk", null, e.target.value)}
                                        />
                                    ) : kar.npk}
                                </td>
                                {/* Nama */}
                                <td rowSpan={4} style={{ ...tdFixed, fontWeight: 500, backgroundColor: "white" }}>
                                    {isEditMode ? (
                                        <input
                                            style={{ width: "100%", border: "1px solid #93c5fd", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}
                                            value={kar.nama}
                                            onChange={(e) => onEdit(kIdx, "nama", null, e.target.value)}
                                        />
                                    ) : kar.nama}
                                </td>
                                {/* Jabatan */}
                                <td rowSpan={4} style={{ ...tdFixed, backgroundColor: "white" }}>
                                    {isEditMode ? (
                                        <input
                                            style={{ width: "100%", border: "1px solid #93c5fd", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}
                                            value={kar.jabatan}
                                            onChange={(e) => onEdit(kIdx, "jabatan", null, e.target.value)}
                                        />
                                    ) : kar.jabatan}
                                </td>
                                {/* Bagian */}
                                <td rowSpan={4} style={{ ...tdFixed, backgroundColor: "white" }}>
                                    {isEditMode ? (
                                        <input
                                            style={{ width: "100%", border: "1px solid #93c5fd", borderRadius: 4, padding: "2px 4px", fontSize: 11 }}
                                            value={kar.bagian}
                                            onChange={(e) => onEdit(kIdx, "bagian", null, e.target.value)}
                                        />
                                    ) : kar.bagian}
                                </td>

                                {/* Label K */}
                                <td style={{ ...tdFixed, fontWeight: 600, backgroundColor: "white", color: "#000000", textAlign: "center" }}>
                                    Kompetensi
                                </td>
                                {/* Nilai kompetensi */}
                                {data.kompetensi.map((_, ci) => {
                                    const val = kar.kompetensiValues[ci] ?? null;
                                    const std = kar.standarKompetensi[ci] ?? 2;
                                    return (
                                        <td
                                            key={ci}
                                            style={{
                                                border: "1px solid #d1d5db",
                                                textAlign: "center",
                                                backgroundColor: "white",
                                                minWidth: 34,
                                                padding: "4px 2px",
                                            }}
                                        >
                                            {isEditMode ? (
                                                <input
                                                    type="number"
                                                    style={{
                                                        width: "100%", textAlign: "center", backgroundColor: "transparent",
                                                        fontSize: 11, padding: "2px 1px", border: "none",
                                                    }}
                                                    value={val ?? ""}
                                                    min={0} max={5} step={1}
                                                    onChange={(e) =>
                                                        onEdit(kIdx, "kompetensiValues", ci,
                                                            e.target.value === "" ? null : parseInt(e.target.value))
                                                    }
                                                />
                                            ) : val !== null ? <PieChart value={val} /> : ""}
                                        </td>
                                    );
                                })}
                                {/* Hasil */}
                                <td rowSpan={4} style={{
                                    border: "1px solid #d1d5db",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: 11,
                                    backgroundColor: "white",
                                    color: "#1f3864",
                                    verticalAlign: "middle",
                                }}>
                                    {calcAverage(kar.kompetensiValues)}
                                </td>
                            </tr>

                            {/* ── Baris 2: SK (Standar Kompetensi) ── */}
                            <tr>
                                <td style={{ ...tdFixed, fontWeight: 600, backgroundColor: "white", color: "#000000", textAlign: "center" }}>
                                    Standar Kompetensi
                                </td>
                                {data.kompetensi.map((_, ci) => {
                                    const val = kar.standarKompetensi[ci] ?? null;
                                    return (
                                        <td
                                            key={ci}
                                            style={{
                                                border: "1px solid #d1d5db",
                                                textAlign: "center",
                                                backgroundColor: "white",
                                                padding: "4px 2px",
                                            }}
                                        >
                                            {isEditMode ? (
                                                <input
                                                    type="number"
                                                    style={{
                                                        width: "100%", textAlign: "center", backgroundColor: "transparent",
                                                        fontSize: 11, padding: "1px", border: "none",
                                                    }}
                                                    value={val ?? ""}
                                                    min={0} max={5}
                                                    onChange={(e) =>
                                                        onEdit(kIdx, "standarKompetensi", ci,
                                                            e.target.value === "" ? null : parseFloat(e.target.value))
                                                    }
                                                />
                                            ) : val !== null ? <PieChart value={val} /> : ""}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* ── Baris 3: Metode Fulfillment ── */}
                            <tr>
                                <td style={{ ...tdFixed, fontWeight: 600, backgroundColor: "white", color: "#000000", textAlign: "center" }}>
                                    Metode Fulfillment
                                </td>
                                {data.kompetensi.map((_, ci) => {
                                    const val = (kar.metodeFulfillment || [])[ci] ?? null;
                                    return (
                                        <td
                                            key={ci}
                                            style={{
                                                border: "1px solid #d1d5db",
                                                textAlign: "center",
                                                backgroundColor: "white",
                                                color: "#000000",
                                                padding: "1px",
                                                fontSize: 10,
                                            }}
                                        >
                                            {isEditMode ? (
                                                <input
                                                    style={{
                                                        width: "100%", textAlign: "center", backgroundColor: "transparent",
                                                        fontSize: 10, padding: "1px", border: "none",
                                                    }}
                                                    value={val ?? ""}
                                                    placeholder=""
                                                    onChange={(e) =>
                                                        onEdit(kIdx, "metodeFulfillment", ci, e.target.value || null)
                                                    }
                                                />
                                            ) : val ?? ""}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* ── Baris 4: Schedule Fulfillment ── */}
                            <tr>
                                <td style={{ ...tdFixed, fontWeight: 600, backgroundColor: "white", color: "#000000", textAlign: "center" }}>
                                    Schedule Fulfillment
                                </td>
                                {data.kompetensi.map((_, ci) => {
                                    const val = (kar.scheduleFulfillment || [])[ci] ?? null;
                                    return (
                                        <td
                                            key={ci}
                                            style={{
                                                border: "1px solid #d1d5db",
                                                textAlign: "center",
                                                backgroundColor: "white",
                                                color: "#000000",
                                                padding: "1px",
                                                fontSize: 10,
                                            }}
                                        >
                                            {isEditMode ? (
                                                <input
                                                    style={{
                                                        width: "100%", textAlign: "center", backgroundColor: "transparent",
                                                        fontSize: 10, padding: "1px", border: "none",
                                                    }}
                                                    value={val ?? ""}
                                                    placeholder=""
                                                    onChange={(e) =>
                                                        onEdit(kIdx, "scheduleFulfillment", ci, e.target.value || null)
                                                    }
                                                />
                                            ) : val ?? ""}
                                        </td>
                                    );
                                })}
                            </tr>

                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Keterangan = () => (
    <div className="keterangan-box" style={{ marginTop: 16, border: "1px solid #9ca3af", backgroundColor: "#fff", padding: "12px 16px" }}>
        <p style={{ fontWeight: "bold", fontSize: 12, color: "#111827", marginBottom: 8 }}>Keterangan :</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 11 }}>
            <div>
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>SK / K</p>
                <div style={{ marginBottom: 4 }}>
                    <span><strong>K</strong> = Kompetensi / Kompeten</span>
                </div>
                <div>
                    <span><strong>BK</strong> = Belum Kompeten</span>
                </div>
            </div>
            <div>
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hasil Kompetensi</p>
                {[
                    { bg: "#c6efce", text: "#276221", label: "K", desc: "= KOMPETEN / DISARANKAN" },
                    { bg: "#ffeb9c", text: "#9c5700", label: "D", desc: "= DEVELOP" },
                    { bg: "#ffc7ce", text: "#9c0006", label: "T", desc: "= TIDAK KOMPETEN / TIDAK DISARANKAN" },
                ].map(({ bg, text, label, desc }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{
                            width: 28, height: 18,
                            border: "1px solid #9ca3af",
                            backgroundColor: bg, color: text,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "bold", fontSize: 10,
                        }}>
                            {label}
                        </div>
                        <span>{desc}</span>
                    </div>
                ))}
            </div>
            <div>
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>Score</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                        { value: 1, desc: "Basic" },
                        { value: 2, desc: "Apply" },
                        { value: 3, desc: "Intermediate" },
                        { value: 4, desc: "Advance" },
                    ].map(({ value, desc }) => (
                        <div key={value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <PieChart value={value} />
                            </div>
                            <span style={{ fontWeight: "bold" }}>{value}</span>
                            <span>{desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const MatriksSkill = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedDept, setSelectedDept] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [deptData, setDeptData] = useState(() => {
        const init = {};
        DEPARTMENTS_DATA.forEach((d) => {
            init[d.id] = JSON.parse(JSON.stringify(d.matriksData));
        });
        return init;
    });

    const [dataLoading, setDataLoading] = useState(false);
    const [dataInitialized, setDataInitialized] = useState(false);

    useEffect(() => {
        if (!user) return;

        const loadApprovedData = async () => {
            setDataLoading(true);
            try {
                const response = await api.get('/matriks-skill-change-requests/approved-data');
                if (response.data.success && response.data.data.length > 0) {
                    setDeptData((prev) => {
                        const updated = { ...prev };
                        response.data.data.forEach((item) => {
                            if (item.deptId && item.matriksData) {
                                updated[item.deptId] = item.matriksData;
                            }
                        });
                        return updated;
                    });
                }
            } catch (error) {
                console.error("[MatriksSkill] Gagal load approved data:", error?.response?.status, error?.message);
            } finally {
                setDataLoading(false);
                setDataInitialized(true);
            }
        };

        loadApprovedData();
    }, [user]);

    const handlePrint = () => {
        const oldStyle = document.getElementById("matriks-print-style");
        if (oldStyle) oldStyle.remove();

        const printStyle = document.createElement("style");
        printStyle.id = "matriks-print-style";
        printStyle.innerHTML = `
            @media print {
                @page {
                    size: A4 landscape;
                    margin: 3mm;
                }

                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                }

                body * {
                    visibility: hidden;
                }

                .matriks-print-container,
                .matriks-print-container * {
                    visibility: visible;
                }

                .matriks-print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100% !important;
                    max-width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    page-break-inside: avoid !important;
                }

                /* Sembunyikan tombol */
                button, .no-print {
                    display: none !important;
                    visibility: hidden !important;
                }

                /* Pastikan warna tetap muncul */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Header full width dengan border hitam - DIPERKUAT */
                .matriks-print-container > div:first-child {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 100% !important;
                    border: 1px solid #000000 !important;
                    box-sizing: border-box !important;
                }

                /* Semua border di header hitam */
                .matriks-print-container > div:first-child * {
                    border-color: #000000 !important;
                }

                /* Pastikan flex container di header juga full width */
                .matriks-print-container > div:first-child > div {
                    width: 100% !important;
                    box-sizing: border-box !important;
                }

                /* Table full width dengan border hitam */
                .matriks-print-container table {
                    width: 100% !important;
                    max-width: 100% !important;
                    font-size: 6px !important;
                    border-collapse: collapse !important;
                    page-break-inside: avoid !important;
                    table-layout: auto !important;
                    border: 1px solid #000000 !important;
                    box-sizing: border-box !important;
                }

                .matriks-print-container th,
                .matriks-print-container td {
                    padding: 1px 0.5px !important;
                    font-size: 6px !important;
                    border: 1px solid #000000 !important;
                }

                /* Wrapper table full width */
                .matriks-print-container > div {
                    width: 100% !important;
                    max-width: 100% !important;
                    overflow: visible !important;
                    box-sizing: border-box !important;
                }

                /* PENTING: Gunakan zoom agar layout dihitung dengan benar & tidak terpotong */
                .matriks-print-container {
                    zoom: 0.72;
                }

                /* Keterangan juga full width dengan border hitam */
                .matriks-print-container > div:last-child {
                    width: 100% !important;
                    border-color: #000000 !important;
                    box-sizing: border-box !important;
                }

                .matriks-print-container > div:last-child * {
                    border-color: #000000 !important;
                }

                /* Pastikan keterangan tidak terpotong ke halaman baru */
                .keterangan-box {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    page-break-before: avoid !important;
                    break-before: avoid !important;
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(printStyle);

        setTimeout(() => {
            window.print();
        }, 250);
    };

    const departmentPermissions = {
        "Quality Assurance": ["QA Department", "Manage Users"],
        "Management Representative": ["Management Representative", "Manage Users"],
        "Finance": ["Finance Department", "Manage Users"],
        "HRGA & IT": ["HRGA & IT Department", "Manage Users"],
        "Management Development": ["Management Development", "Manage Users"],
        "Manufacturing Battery": ["Manufacturing Battery", "Manage Users"],
        "Manufacturing Cable": ["Manufacturing Cable", "Manage Users"],
        "Marketing Battery": ["Marketing Battery Department", "Manage Users"],
        "Marketing Engineering": ["Marketing Engineering", "Manage Users"],
        "MI SHE": ["MI & SHE", "Manage Users"],
        "PPIC": ["PPIC", "Manage Users"],
        "Purchasing": ["Purchasing", "Manage Users"],
    };

    const canEditDept = React.useCallback((deptName) => {
        if (!user) return false;
        const perms = typeof user?.role === "object" ? (user?.role?.permissions ?? []) : [];
        if (perms.includes("Manage Users")) return true;
        const userDeptName = user?.department?.name;
        if (userDeptName === deptName) return true;
        const required = departmentPermissions[deptName] || [];
        return required.some((p) => perms.includes(p));
    }, [user]);

    const handleEdit = (deptId, karyawanIdx, field, colIdx, value) => {
        setDeptData((prev) => {
            const next = { ...prev };
            const dept = JSON.parse(JSON.stringify(next[deptId]));
            const kar = dept.karyawan[karyawanIdx];
            if (colIdx !== null) {
                kar[field] = [...kar[field]];
                kar[field][colIdx] = value;
            } else {
                kar[field] = value;
            }
            next[deptId] = dept;
            return next;
        });
    };

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({
        title: "",
        description: "",
        changeType: "update",
        priority: "medium",
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSave = () => {
        if (!selectedDept) return;
        setRequestForm({
            title: `Perubahan Matriks Skill - ${selectedDept.name}`,
            description: "",
            changeType: "update",
            priority: "medium",
        });
        setShowRequestModal(true);
    };

    const handleSubmitRequest = async () => {
        if (!requestForm.title.trim() || !requestForm.description.trim()) {
            alert("⚠️ Judul dan deskripsi harus diisi.");
            return;
        }

        try {
            setSubmitLoading(true);
            const currentDeptRaw = DEPARTMENTS_DATA.find((d) => d.id === selectedDept.id);

            const payload = {
                title: requestForm.title.trim(),
                description: requestForm.description.trim(),
                changeType: requestForm.changeType,
                priority: requestForm.priority,
                department: selectedDept.name,
                proposedData: {
                    deptId: selectedDept.id,
                    matriksData: JSON.parse(JSON.stringify(deptData[selectedDept.id])),
                },
                currentData: currentDeptRaw
                    ? { deptId: selectedDept.id, matriksData: JSON.parse(JSON.stringify(currentDeptRaw.matriksData)) }
                    : null,
            };

            const response = await matriksSkillChangeRequestsAPI.create(payload);
            if (response.data.success) {
                setShowRequestModal(false);
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 4000);
            }
        } catch (error) {
            console.error("Error submitting change request:", error);
            alert(error.response?.data?.message || "Gagal mengirim change request.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleAddKaryawan = () => {
        setDeptData((prev) => {
            const next = { ...prev };
            const dept = JSON.parse(JSON.stringify(next[selectedDept.id]));
            const jumlahKompetensi = dept.kompetensi.length;
            const newNo = (dept.karyawan.length > 0 ? Math.max(...dept.karyawan.map(k => k.no)) : 0) + 1;
            const newKaryawan = {
                no: newNo,
                npk: "",
                nama: "",
                jabatan: "",
                bagian: "",
                kompetensiValues: Array(jumlahKompetensi).fill(null),
                standarKompetensi: Array(jumlahKompetensi).fill(null),
                metodeFulfillment: Array(jumlahKompetensi).fill(null),
                scheduleFulfillment: Array(jumlahKompetensi).fill(null),
            };
            dept.karyawan.push(newKaryawan);
            next[selectedDept.id] = dept;
            return next;
        });
    };

    if (!user || dataLoading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
                <div style={{ width: 40, height: 40, border: "3px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                {dataLoading && <p style={{ color: "#6b7280", fontSize: 14 }}>Memuat data terbaru...</p>}
            </div>
        );
    }

    if (!selectedDept) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Matriks Skill Kompetensi</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Pilih department untuk melihat matriks skill kompetensi
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {DEPARTMENTS_DATA.map((dept) => (
                        <button
                            key={dept.id}
                            onClick={() => { setSelectedDept(dept); setIsEditMode(false); }}
                            className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 p-5 text-left hover:scale-[1.02] group"
                            style={{ borderLeft: `4px solid ${dept.borderColor}` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg text-white flex-shrink-0" style={{ backgroundColor: dept.iconColor }}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                            {dept.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {deptData[dept.id]?.karyawan?.length || 0} karyawan
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {deptData[dept.id]?.kompetensi?.length || 0} kompetensi
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentData = deptData[selectedDept.id];

    return (
        <div>
            <div style={{ padding: "16px 24px 32px" }}>
                <div
                    className="no-print"
                    style={{
                        backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb",
                        padding: "10px 16px",
                        marginBottom: "16px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                            onClick={() => { setSelectedDept(null); setIsEditMode(false); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 4,
                                color: "#2563eb", fontWeight: 500, fontSize: 13,
                                background: "none", border: "none", cursor: "pointer",
                            }}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali
                        </button>

                        <span style={{ color: "#d1d5db" }}>|</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                            {selectedDept.name}
                        </span>

                        {canEditDept(selectedDept.name) ? (
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                style={{
                                    padding: "4px 12px",
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    border: "none",
                                    cursor: "pointer",
                                    backgroundColor: isEditMode ? "#dcfce7" : "#dbeafe",
                                    color: isEditMode ? "#166534" : "#1d4ed8",
                                }}
                            >
                                {isEditMode ? "👁 View Mode" : "✏️ Edit Mode"}
                            </button>
                        ) : (
                            <span style={{
                                padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                backgroundColor: "#f3f4f6", color: "#9ca3af", cursor: "default",
                            }} title="Anda tidak memiliki akses edit untuk department ini">
                                👁 View Only
                            </span>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isEditMode && (
                            <button
                                onClick={handleAddKaryawan}
                                style={{
                                    backgroundColor: "#7c3aed", color: "#fff",
                                    padding: "6px 16px", borderRadius: 8,
                                    fontSize: 12, fontWeight: 600,
                                    border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 6,
                                }}
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah
                            </button>
                        )}
                        {isEditMode && (
                            <button
                                onClick={handleSave}
                                style={{
                                    backgroundColor: "#16a34a", color: "#fff",
                                    padding: "6px 16px", borderRadius: 8,
                                    fontSize: 12, fontWeight: 600,
                                    border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 6,
                                }}
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Submit Change Request
                            </button>
                        )}

                        <button
                            onClick={handlePrint}
                            style={{
                                backgroundColor: "#2563eb", color: "#fff",
                                padding: "6px 16px", borderRadius: 8,
                                fontSize: 12, fontWeight: 600,
                                border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 6,
                            }}
                            className="no-print"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                    </div>
                </div>

                {/* ── Submit Change Request Modal ── */}
                {showRequestModal && (
                    <div style={{
                        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
                        zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
                    }}>
                        <div style={{
                            backgroundColor: "#fff", borderRadius: 12, width: "100%", maxWidth: 520,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden",
                        }}>
                            {/* Modal header */}
                            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h2 style={{ fontWeight: 700, fontSize: 17, color: "#111827", margin: 0 }}>Submit Change Request</h2>
                                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{selectedDept?.name} — Matriks Kompetensi Skill</p>
                                </div>
                                <button onClick={() => setShowRequestModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</button>
                            </div>

                            {/* Modal body */}
                            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Judul *</label>
                                    <input
                                        value={requestForm.title}
                                        onChange={(e) => setRequestForm((p) => ({ ...p, title: e.target.value }))}
                                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }}
                                        placeholder="Judul perubahan..."
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Deskripsi / Alasan Perubahan *</label>
                                    <textarea
                                        value={requestForm.description}
                                        onChange={(e) => setRequestForm((p) => ({ ...p, description: e.target.value }))}
                                        rows={4}
                                        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                                        placeholder="Jelaskan alasan dan detail perubahan yang dilakukan..."
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Tipe Perubahan</label>
                                        <select
                                            value={requestForm.changeType}
                                            onChange={(e) => setRequestForm((p) => ({ ...p, changeType: e.target.value }))}
                                            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
                                        >
                                            <option value="update">Update</option>
                                            <option value="add">Add</option>
                                            <option value="delete">Delete</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Prioritas</label>
                                        <select
                                            value={requestForm.priority}
                                            onChange={(e) => setRequestForm((p) => ({ ...p, priority: e.target.value }))}
                                            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: "#f9fafb" }}>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    disabled={submitLoading}
                                    style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db", backgroundColor: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmitRequest}
                                    disabled={submitLoading}
                                    style={{
                                        padding: "8px 18px", borderRadius: 8, border: "none",
                                        backgroundColor: submitLoading ? "#86efac" : "#16a34a",
                                        color: "#fff", cursor: submitLoading ? "not-allowed" : "pointer",
                                        fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                                    }}
                                >
                                    {submitLoading ? (
                                        <>
                                            <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                            Mengirim...
                                        </>
                                    ) : "📤 Submit Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="matriks-print-container">
                    <DocHeader data={currentData} />

                    <MatriksTable
                        data={currentData}
                        isEditMode={isEditMode}
                        onEdit={(kIdx, field, ci, val) =>
                            handleEdit(selectedDept.id, kIdx, field, ci, val)
                        }
                    />
                    <Keterangan />
                </div>
            </div>
        </div>
    );
};

export default MatriksSkill;