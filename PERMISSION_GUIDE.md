# 🔐 Permission System Guide - SO Dashboard

## Perubahan Permission System

### ❌ **DIHAPUS**: Permission Lama
- ~~`View SO Details`~~ - Permission umum yang tidak membatasi akses per departemen

### ✅ **DITAMBAHKAN**: Permission Baru (2 Kategori Terpisah)

#### 1. **View All SO Details** (Admin Only)
- **Untuk**: Administrator / Super User
- **Akses**: Dapat melihat dan mengklik **SEMUA** SO Turunan dari semua departemen
- **Fungsi**: Tidak ada batasan departemen

#### 2. **Job Description Department Access**
Permission untuk **mengelola Job Description** per departemen:

| Permission | Fungsi |
|-----------|--------|
| `Finance Department` | Manage Job Description Finance |
| `HRGA & IT Department` | Manage Job Description HRGA & IT |
| `Management Development` | Manage Job Description Management Dev |
| `Management Representative` | Manage Job Description Management Rep |
| `Manufacturing Battery` | Manage Job Description Manufacturing Battery |
| `Manufacturing Cable` | Manage Job Description Manufacturing Cable |
| `Marketing Battery Department` | Manage Job Description Marketing Battery |
| `Marketing Engineering` | Manage Job Description Marketing Engineering |
| `MI & SHE` | Manage Job Description MI & SHE |
| `PPIC` | Manage Job Description PPIC |
| `Purchasing` | Manage Job Description Purchasing |
| `QA Department` | Manage Job Description QA |

#### 3. **SO Details View Access** (Per Department)
Permission untuk **melihat SO Turunan** (struktur organisasi detail) per departemen:

| Permission | Route | Fungsi |
|-----------|-------|--------|
| `View Finance SO` | `/finance-department` | View Finance SO Details |
| `View HRGA & IT SO` | `/hrga-it-department` | View HRGA & IT SO Details |
| `View Management Dev SO` | `/management-development` | View Management Dev SO Details |
| `View Management Rep SO` | `/management-representative` | View Management Rep SO Details |
| `View Manufacturing Battery SO` | `/manufactur-battery` | View Manufacturing Battery SO Details |
| `View Manufacturing Cable SO` | `/manufacturing-cable` | View Manufacturing Cable SO Details |
| `View Marketing Battery SO` | `/marketing-battery-department` | View Marketing Battery SO Details |
| `View Marketing Engineering SO` | `/marketing-engineering` | View Marketing Engineering SO Details |
| `View MI & SHE SO` | `/mi-she` | View MI & SHE SO Details |
| `View PPIC SO` | `/ppic` | View PPIC SO Details |
| `View Purchasing SO` | `/purchasing` | View Purchasing SO Details |
| `View QA SO` | `/qa-department` | View QA SO Details |

---

## 📋 Contoh Konfigurasi Role

### 1. **Admin / Super User**
```javascript
{
  name: "Admin",
  permissions: [
    "View Dashboard",
    "Manage Users",
    "Manage Roles",
    "Manage Departments",
    "SO DCI Editor",
    "SO Bagian Editor",
    "Print SO",
    "View All SO Details",  // ✅ Bisa VIEW semua SO Turunan departemen
    "Jobdesc Management",
    
    // Job Description Access - semua departemen
    "Finance Department",
    "HRGA & IT Department",
    "QA Department",
    "PPIC",
    // ... (semua department permissions untuk Jobdesc)
  ]
}
```

### 2. **QA Department Manager**
```javascript
{
  name: "QA Manager",
  permissions: [
    "View Dashboard",
    "Print SO",
    "QA Department",      // ✅ Akses Job Description QA Department
    "View QA SO",        // ✅ View SO Turunan QA Department
    "Jobdesc Management"
  ]
}
```

### 3. **Multi-Department User** (HR Manager)
```javascript
{
  name: "HR Manager",
  permissions: [
    "View Dashboard",
    "Manage Users",
    "Print SO",
    "Jobdesc Management",
    
    // Job Description Access
    "HRGA & IT Department",   // ✅ Manage Jobdesc HRGA & IT
    "Finance Department",     // ✅ Manage Jobdesc Finance
    "Purchasing",            // ✅ Manage Jobdesc Purchasing
    
    // SO Details View Access
    "View HRGA & IT SO",     // ✅ View SO Turunan HRGA & IT
    "View Finance SO",       // ✅ View SO Turunan Finance
    "View Purchasing SO"     // ✅ View SO Turunan Purchasing
  ]
}
```

### 4. **Staff Biasa** (Hanya View Departemen Sendiri)
```javascript
{
  name: "Manufacturing Staff",
  permissions: [
    "View Dashboard",
    "View Manufacturing Cable SO"  // ✅ Hanya view SO Manufacturing Cable
  ]
}
```

### 5. **Department Supervisor** (View SO + Manage Jobdesc)
```javascript
{
  name: "PPIC Supervisor",
  permissions: [
    "View Dashboard",
    "Print SO",
    "PPIC",              // ✅ Manage Job Description PPIC
    "View PPIC SO",      // ✅ View SO Turunan PPIC
    "Jobdesc Management"
  ]
}
```

---

## 🎯 Cara Kerja

### Dashboard Behavior:

1. **User tanpa permission departemen**
   - ❌ Tombol code tidak clickable
   - ❌ Tidak bisa navigate ke SO Turunan
   - ❌ Tidak ada hover effect biru

2. **User dengan permission departemen spesifik**
   - ✅ Tombol code berwarna biru dan clickable
   - ✅ Bisa klik untuk view job description
   - ✅ Bisa navigate ke SO Turunan departemen tersebut
   - ❌ **TIDAK BISA** akses departemen lain

3. **Admin dengan "View All SO Details"**
   - ✅ Semua tombol code clickable
   - ✅ Bisa akses **SEMUA** SO Turunan
   - ✅ Tidak ada batasan departemen

---

## 🔧 Implementasi Teknis

### File yang Diubah:

1. **`frontend/src/pages/RolePermission.jsx`**
   - Updated `availablePermissions` array
   - Menghapus `View SO Details`
   - Menambahkan `View All SO Details`

2. **`frontend/src/pages/Dashboard.jsx`**
   - Menambahkan `routePermissionMap` untuk mapping route ke permission
   - Menambahkan fungsi `canViewDepartmentSO(route)` untuk cek akses
   - Mengganti semua `canViewSODetails` dengan `canViewDepartmentSO(item.route)`

### Logic Permission Check:

```javascript
const canViewDepartmentSO = (route) => {
  if (!route) return false;
  
  const userPermissions = user?.role?.permissions || [];
  
  // Admin dengan "View All SO Details" bisa akses semua
  if (userPermissions.includes('View All SO Details')) {
    return true;
  }
  
  // Cek permission spesifik departemen
  const requiredPermission = routePermissionMap[route];
  if (requiredPermission && userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  return false;
};
```

---

## ⚠️ Migrasi dari System Lama

Jika Anda memiliki role dengan permission `View SO Details` yang lama:

1. **Login sebagai Admin**
2. **Buka Role & Permission**
3. **Edit setiap role** yang memiliki `View SO Details`
4. **Pilih salah satu**:
   - Untuk Admin: Centang `View All SO Details`
   - Untuk User Departemen: Centang permission departemen spesifik (mis: `QA Department`, `PPIC`, dll)
5. **Hapus** permission `View SO Details` yang lama (jika masih ada)
6. **Save**

---

## 📝 Testing Checklist

- [ ] Admin dengan `View All SO Details` bisa akses semua SO Turunan
- [ ] QA Staff dengan `QA Department` hanya bisa akses QA
- [ ] Manufacturing Staff dengan `Manufacturing Cable` hanya bisa akses Manufacturing Cable
- [ ] User tanpa permission tidak bisa klik code button
- [ ] Multi-department user bisa akses beberapa departemen sesuai permission

---

## 🆘 Troubleshooting

**Q: User tidak bisa klik code button di dashboard?**  
A: Pastikan user memiliki permission departemen yang sesuai atau `View All SO Details` untuk admin.

**Q: Admin tidak bisa akses semua departemen?**  
A: Pastikan role admin memiliki permission `View All SO Details`.

**Q: Tombol code tidak berwarna biru?**  
A: Ini normal jika user tidak memiliki permission untuk departemen tersebut.

---

**Updated**: October 31, 2025  
**Version**: 2.0  
**Breaking Changes**: Yes - Permission `View SO Details` dihapus
