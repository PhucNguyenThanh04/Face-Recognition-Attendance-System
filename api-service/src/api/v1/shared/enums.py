import enum


# ── Users ──────────────────────────────────────────────────────────────────

class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    locked = "locked"


class RoleName(str, enum.Enum):
    admin = "admin"
    hr = "hr"
    manager = "manager"
    employee = "employee"


# ── Employees ──────────────────────────────────────────────────────────────

class EmployeeStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    resigned = "resigned"


# ── Face Profiles ──────────────────────────────────────────────────────────

class FaceProfileStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    revoked = "revoked"
    failed = "failed"


class FaceImageStatus(str, enum.Enum):
    accepted = "accepted"
    rejected = "rejected"


# ── Attendance ─────────────────────────────────────────────────────────────

class AttendanceEventType(str, enum.Enum):
    check_in = "check_in"
    check_out = "check_out"
    unknown = "unknown"


class AttendanceRecordStatus(str, enum.Enum):
    present = "present"
    late = "late"
    early_leave = "early_leave"
    late_and_early_leave = "late_and_early_leave"
    absent = "absent"
    on_leave = "on_leave"
    holiday = "holiday"
    missing_check_in = "missing_check_in"
    missing_check_out = "missing_check_out"
    manually_edited = "manually_edited"


class AttendanceSource(str, enum.Enum):
    face_recognition = "face_recognition"
    manual = "manual"
    edited = "edited"
    system = "system"
