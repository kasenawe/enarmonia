import React, { useEffect, useMemo, useState } from "react";
import {
  Appointment,
  AppUser,
  ClinicalProfile,
  ClinicalSession,
  PainDurationUnit,
  PainZone,
} from "../types";
import {
  db,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from "../firebase";

interface ClinicalRecordsPanelProps {
  users: AppUser[];
  appointments: Appointment[];
  currentAdminUid: string | null;
}

interface ProfileFormState {
  intakeDate: string;
  fullName: string;
  documentId: string;
  birthDate: string;
  phone: string;
  email: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  chiefComplaint: string;
  painZones: PainZone[];
  painZoneOther: string;
  painDurationUnit: PainDurationUnit | "";
  painIntensity: string;
  worseFactors: string;
  reliefFactors: string;
  hypertension: boolean;
  diabetes: boolean;
  heartProblems: boolean;
  osteoporosis: boolean;
  pathologies: string;
  surgeries: string;
  accidents: string;
  currentMedication: string;
  initialDiagnosis: string;
  treatmentStartDate: string;
}

interface SessionFormState {
  appointmentId: string;
  sessionDate: string;
  painLevel: string;
  clinicalObservations: string;
  techniquesApplied: string;
  recommendations: string;
}

const painZoneOptions: { value: PainZone; label: string }[] = [
  { value: "neck", label: "Cuello" },
  { value: "upperBack", label: "Espalda alta" },
  { value: "midBack", label: "Espalda media" },
  { value: "lowerBack", label: "Zona lumbar" },
  { value: "shoulder", label: "Hombro" },
  { value: "arm", label: "Brazo" },
  { value: "hip", label: "Cadera" },
  { value: "leg", label: "Pierna" },
  { value: "other", label: "Otro" },
];

const defaultProfileForm = (): ProfileFormState => ({
  intakeDate: new Date().toISOString().split("T")[0],
  fullName: "",
  documentId: "",
  birthDate: "",
  phone: "",
  email: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  chiefComplaint: "",
  painZones: [],
  painZoneOther: "",
  painDurationUnit: "",
  painIntensity: "",
  worseFactors: "",
  reliefFactors: "",
  hypertension: false,
  diabetes: false,
  heartProblems: false,
  osteoporosis: false,
  pathologies: "",
  surgeries: "",
  accidents: "",
  currentMedication: "",
  initialDiagnosis: "",
  treatmentStartDate: "",
});

const defaultSessionForm = (): SessionFormState => ({
  appointmentId: "",
  sessionDate: new Date().toISOString().split("T")[0],
  painLevel: "",
  clinicalObservations: "",
  techniquesApplied: "",
  recommendations: "",
});

const SESSIONS_PAGE_SIZE = 20;

const ClinicalRecordsPanel: React.FC<ClinicalRecordsPanelProps> = ({
  users,
  appointments,
  currentAdminUid,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(defaultProfileForm);
  const [sessionForm, setSessionForm] =
    useState<SessionFormState>(defaultSessionForm);
  const [clinicalSessions, setClinicalSessions] = useState<ClinicalSession[]>(
    [],
  );
  const [profileMeta, setProfileMeta] = useState<{
    createdAt: string;
    createdBy: string;
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [lastSessionCursor, setLastSessionCursor] = useState<unknown>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionDateFrom, setSessionDateFrom] = useState("");
  const [sessionDateTo, setSessionDateTo] = useState("");
  const [sessionPainFilter, setSessionPainFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  const clientUsers = useMemo(
    () => users.filter((user) => user.role === "client"),
    [users],
  );

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return clientUsers;
    const q = patientSearch.toLowerCase();
    return clientUsers.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.documentId?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [clientUsers, patientSearch]);

  const selectedPatient = useMemo(
    () => clientUsers.find((user) => user.uid === selectedPatientId) || null,
    [clientUsers, selectedPatientId],
  );

  const patientAppointments = useMemo(() => {
    if (!selectedPatientId) return [];

    return appointments
      .filter((appointment) => appointment.userId === selectedPatientId)
      .sort((a, b) => {
        const dateDiff = b.date.localeCompare(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.time.localeCompare(a.time);
      });
  }, [appointments, selectedPatientId]);

  const visibleClinicalSessions = useMemo(() => {
    const searchQuery = sessionSearch.trim().toLowerCase();

    return clinicalSessions.filter((session) => {
      const matchesSearch =
        !searchQuery ||
        session.sessionDate?.toLowerCase().includes(searchQuery) ||
        session.clinicalObservations?.toLowerCase().includes(searchQuery) ||
        session.techniquesApplied?.toLowerCase().includes(searchQuery) ||
        session.recommendations?.toLowerCase().includes(searchQuery);

      const pain = Number(session.painLevel);
      const normalizedPain = Number.isFinite(pain) ? pain : -1;
      const matchesPain =
        sessionPainFilter === "all" ||
        (sessionPainFilter === "low" &&
          normalizedPain >= 0 &&
          normalizedPain <= 3) ||
        (sessionPainFilter === "medium" &&
          normalizedPain >= 4 &&
          normalizedPain <= 6) ||
        (sessionPainFilter === "high" &&
          normalizedPain >= 7 &&
          normalizedPain <= 10);

      const sessionDate = session.sessionDate || "";
      const matchesDateFrom =
        !sessionDateFrom || sessionDate >= sessionDateFrom;
      const matchesDateTo = !sessionDateTo || sessionDate <= sessionDateTo;

      return matchesSearch && matchesPain && matchesDateFrom && matchesDateTo;
    });
  }, [
    clinicalSessions,
    sessionSearch,
    sessionPainFilter,
    sessionDateFrom,
    sessionDateTo,
  ]);

  const getPatientOptionLabel = (user: AppUser) => {
    const name = user.fullName?.trim();
    const documentId = user.documentId?.trim();
    const email = user.email?.trim();

    if (name && documentId) return `${name} - ${documentId}`;
    if (name && email) return `${name} - ${email}`;
    return name || email || user.uid;
  };

  useEffect(() => {
    if (!selectedPatientId) {
      setProfileForm(defaultProfileForm());
      setProfileMeta(null);
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);

    const unsubscribe = onSnapshot(
      doc(db, "clinical_profiles", selectedPatientId),
      (snapshot) => {
        if (!snapshot.exists()) {
          const fallbackName = selectedPatient?.fullName || "";
          const fallbackDocumentId = selectedPatient?.documentId || "";
          const fallbackPhone = selectedPatient?.userPhone || "";
          const fallbackEmail = selectedPatient?.email || "";
          setProfileForm({
            ...defaultProfileForm(),
            fullName: fallbackName,
            documentId: fallbackDocumentId,
            phone: fallbackPhone,
            email: fallbackEmail,
          });
          setProfileMeta(null);
          setIsLoadingProfile(false);
          return;
        }

        const data = snapshot.data() as ClinicalProfile;
        setProfileForm({
          intakeDate: data.intakeDate || "",
          fullName: data.fullName || "",
          documentId: data.documentId || "",
          birthDate: data.birthDate || "",
          phone: data.phone || "",
          email: data.email || selectedPatient?.email || "",
          occupation: data.occupation || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
          chiefComplaint: data.chiefComplaint || "",
          painZones: data.painZones || [],
          painZoneOther: data.painZoneOther || "",
          painDurationUnit: data.painDurationUnit || "",
          painIntensity:
            typeof data.painIntensity === "number"
              ? String(data.painIntensity)
              : "",
          worseFactors: data.worseFactors || "",
          reliefFactors: data.reliefFactors || "",
          hypertension: data.healthHistory?.hypertension || false,
          diabetes: data.healthHistory?.diabetes || false,
          heartProblems: data.healthHistory?.heartProblems || false,
          osteoporosis: data.healthHistory?.osteoporosis || false,
          pathologies: data.healthHistory?.pathologies || "",
          surgeries: data.healthHistory?.surgeries || "",
          accidents: data.healthHistory?.accidents || "",
          currentMedication: data.healthHistory?.currentMedication || "",
          initialDiagnosis: data.initialDiagnosis || "",
          treatmentStartDate: data.treatmentStartDate || "",
        });

        setProfileMeta({
          createdAt: data.createdAt || new Date().toISOString(),
          createdBy: data.createdBy || currentAdminUid || "",
        });

        setIsLoadingProfile(false);
      },
      (error) => {
        console.error(error);
        setProfileError(
          "No se pudo cargar la ficha clínica de ingreso para este paciente.",
        );
        setIsLoadingProfile(false);
      },
    );

    return () => unsubscribe();
  }, [selectedPatientId, selectedPatient, currentAdminUid]);

  useEffect(() => {
    if (!selectedPatientId) {
      setClinicalSessions([]);
      setIsLoadingSessions(false);
      setHasMoreSessions(false);
      setLastSessionCursor(null);
      setSessionSearch("");
      setSessionDateFrom("");
      setSessionDateTo("");
      setSessionPainFilter("all");
      return;
    }

    let cancelled = false;

    const loadInitialSessions = async () => {
      setIsLoadingSessions(true);
      setSessionError(null);

      try {
        const sessionsQuery = query(
          collection(db, "clinical_sessions"),
          where("patientId", "==", selectedPatientId),
          orderBy("sessionDate", "desc"),
          orderBy("sessionNumber", "desc"),
          limit(SESSIONS_PAGE_SIZE),
        );

        const snapshot = await getDocs(sessionsQuery);
        if (cancelled) return;

        const loadedSessions: ClinicalSession[] = snapshot.docs.map(
          (entry) => ({
            id: entry.id,
            ...(entry.data() as Omit<ClinicalSession, "id">),
          }),
        );

        setClinicalSessions(loadedSessions);
        setHasMoreSessions(snapshot.docs.length === SESSIONS_PAGE_SIZE);
        setLastSessionCursor(snapshot.docs[snapshot.docs.length - 1] || null);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setSessionError(
            "No se pudo cargar la evolución clínica del paciente seleccionado.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSessions(false);
        }
      }
    };

    void loadInitialSessions();

    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  const handleLoadMoreSessions = async () => {
    if (!selectedPatientId || !lastSessionCursor || isLoadingMoreSessions) {
      return;
    }

    setIsLoadingMoreSessions(true);
    setSessionError(null);

    try {
      const sessionsQuery = query(
        collection(db, "clinical_sessions"),
        where("patientId", "==", selectedPatientId),
        orderBy("sessionDate", "desc"),
        orderBy("sessionNumber", "desc"),
        startAfter(lastSessionCursor as never),
        limit(SESSIONS_PAGE_SIZE),
      );

      const snapshot = await getDocs(sessionsQuery);
      const loadedSessions: ClinicalSession[] = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...(entry.data() as Omit<ClinicalSession, "id">),
      }));

      setClinicalSessions((current) => [...current, ...loadedSessions]);
      setHasMoreSessions(snapshot.docs.length === SESSIONS_PAGE_SIZE);
      if (snapshot.docs.length > 0) {
        setLastSessionCursor(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error(error);
      setSessionError("No se pudieron cargar más sesiones.");
    } finally {
      setIsLoadingMoreSessions(false);
    }
  };

  const togglePainZone = (zone: PainZone) => {
    setProfileForm((current) => {
      const included = current.painZones.includes(zone);
      return {
        ...current,
        painZones: included
          ? current.painZones.filter((value) => value !== zone)
          : [...current.painZones, zone],
      };
    });
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError(null);
    setProfileFeedback(null);

    if (!selectedPatientId) {
      setProfileError("Selecciona un paciente para guardar su ficha clínica.");
      return;
    }

    if (!currentAdminUid) {
      setProfileError("No se pudo validar la sesión administradora.");
      return;
    }

    const normalizedPain = Number(profileForm.painIntensity);
    if (
      profileForm.painIntensity &&
      (!Number.isFinite(normalizedPain) ||
        normalizedPain < 0 ||
        normalizedPain > 10)
    ) {
      setProfileError("La intensidad del dolor debe estar entre 0 y 10.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const nowIso = new Date().toISOString();
      await setDoc(
        doc(db, "clinical_profiles", selectedPatientId),
        {
          patientId: selectedPatientId,
          intakeDate: profileForm.intakeDate,
          fullName: profileForm.fullName.trim(),
          documentId: profileForm.documentId.trim(),
          birthDate: profileForm.birthDate,
          phone: profileForm.phone.trim(),
          email: profileForm.email.trim(),
          occupation: profileForm.occupation.trim(),
          emergencyContactName: profileForm.emergencyContactName.trim(),
          emergencyContactPhone: profileForm.emergencyContactPhone.trim(),
          chiefComplaint: profileForm.chiefComplaint.trim(),
          painZones: profileForm.painZones,
          painZoneOther: profileForm.painZoneOther.trim(),
          painDurationUnit: profileForm.painDurationUnit,
          painIntensity: profileForm.painIntensity ? normalizedPain : 0,
          worseFactors: profileForm.worseFactors.trim(),
          reliefFactors: profileForm.reliefFactors.trim(),
          healthHistory: {
            hypertension: profileForm.hypertension,
            diabetes: profileForm.diabetes,
            heartProblems: profileForm.heartProblems,
            osteoporosis: profileForm.osteoporosis,
            pathologies: profileForm.pathologies.trim(),
            surgeries: profileForm.surgeries.trim(),
            accidents: profileForm.accidents.trim(),
            currentMedication: profileForm.currentMedication.trim(),
          },
          initialDiagnosis: profileForm.initialDiagnosis.trim(),
          treatmentStartDate: profileForm.treatmentStartDate,
          createdAt: profileMeta?.createdAt || nowIso,
          createdBy: profileMeta?.createdBy || currentAdminUid,
          updatedAt: nowIso,
          updatedBy: currentAdminUid,
        },
        { merge: true },
      );

      setProfileFeedback("Ficha de ingreso guardada correctamente.");
    } catch (error) {
      console.error(error);
      setProfileError("No se pudo guardar la ficha clínica.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSessionError(null);
    setSessionFeedback(null);

    if (!selectedPatientId) {
      setSessionError("Selecciona un paciente para registrar evolución.");
      return;
    }

    if (!currentAdminUid) {
      setSessionError("No se pudo validar la sesión administradora.");
      return;
    }

    const painLevel = Number(sessionForm.painLevel);
    if (!Number.isFinite(painLevel) || painLevel < 0 || painLevel > 10) {
      setSessionError("El dolor de sesión debe estar entre 0 y 10.");
      return;
    }

    if (
      !sessionForm.sessionDate ||
      !sessionForm.clinicalObservations.trim() ||
      !sessionForm.techniquesApplied.trim() ||
      !sessionForm.recommendations.trim()
    ) {
      setSessionError(
        "Completa fecha, observaciones, técnicas aplicadas y recomendaciones.",
      );
      return;
    }

    setIsSavingSession(true);

    try {
      const nowIso = new Date().toISOString();
      const countSnapshot = await getCountFromServer(
        query(
          collection(db, "clinical_sessions"),
          where("patientId", "==", selectedPatientId),
        ),
      );
      const nextSessionNumber = Number(countSnapshot.data().count) + 1;

      await addDoc(collection(db, "clinical_sessions"), {
        patientId: selectedPatientId,
        appointmentId: sessionForm.appointmentId || "",
        sessionNumber: nextSessionNumber,
        sessionDate: sessionForm.sessionDate,
        painLevel,
        clinicalObservations: sessionForm.clinicalObservations.trim(),
        techniquesApplied: sessionForm.techniquesApplied.trim(),
        recommendations: sessionForm.recommendations.trim(),
        createdAt: nowIso,
        createdBy: currentAdminUid,
        updatedAt: nowIso,
        updatedBy: currentAdminUid,
      });

      setSessionForm(defaultSessionForm());
      setSessionFeedback("Evolución de sesión guardada correctamente.");
    } catch (error) {
      console.error(error);
      setSessionError("No se pudo guardar la evolución de la sesión.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("¿Eliminar esta evolución clínica?")) return;

    setSessionError(null);
    setSessionFeedback(null);

    try {
      await deleteDoc(doc(db, "clinical_sessions", sessionId));
      setSessionFeedback("Evolución eliminada correctamente.");
    } catch (error) {
      console.error(error);
      setSessionError("No se pudo eliminar la evolución seleccionada.");
    }
  };

  return (
    <div className="space-y-6">
      {(profileError || sessionError) && (
        <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm space-y-1">
          {profileError && <p>{profileError}</p>}
          {sessionError && <p>{sessionError}</p>}
        </div>
      )}

      {(profileFeedback || sessionFeedback) && (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm space-y-1">
          {profileFeedback && <p>{profileFeedback}</p>}
          {sessionFeedback && <p>{sessionFeedback}</p>}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800">Paciente</h4>
          <p className="text-gray-400 text-[11px]">
            Selecciona un usuario cliente para cargar su ficha de ingreso y
            evolución.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              setShowPatientDropdown(true);
              if (selectedPatientId) {
                setSelectedPatientId("");
                setProfileError(null);
                setProfileFeedback(null);
                setSessionError(null);
                setSessionFeedback(null);
              }
            }}
            onFocus={() => setShowPatientDropdown(true)}
            onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
            placeholder="Buscar paciente por nombre, documento o email..."
            className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 pr-10"
          />
          {selectedPatientId && (
            <button
              type="button"
              onClick={() => {
                setSelectedPatientId("");
                setPatientSearch("");
                setProfileError(null);
                setProfileFeedback(null);
                setSessionError(null);
                setSessionFeedback(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xl leading-none"
              aria-label="Limpiar selección"
            >
              ×
            </button>
          )}
          {showPatientDropdown && filteredPatients.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
              {filteredPatients.map((user) => (
                <li
                  key={user.uid}
                  onMouseDown={() => {
                    setSelectedPatientId(user.uid);
                    setPatientSearch(getPatientOptionLabel(user));
                    setShowPatientDropdown(false);
                    setProfileError(null);
                    setProfileFeedback(null);
                    setSessionError(null);
                    setSessionFeedback(null);
                  }}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  {getPatientOptionLabel(user)}
                </li>
              ))}
            </ul>
          )}
          {showPatientDropdown &&
            patientSearch.trim() &&
            filteredPatients.length === 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 text-sm text-gray-400">
                No se encontraron pacientes
              </div>
            )}
        </div>

        {selectedPatient && (
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-600">
            <p>
              <span className="font-bold">Nombre:</span>{" "}
              {selectedPatient.fullName || "Sin dato"}
            </p>
            <p>
              <span className="font-bold">Documento:</span>{" "}
              {selectedPatient.documentId || "Sin dato"}
            </p>
            <p>
              <span className="font-bold">UID:</span> {selectedPatient.uid}
            </p>
            <p>
              <span className="font-bold">Email:</span> {selectedPatient.email}
            </p>
            <p>
              <span className="font-bold">Teléfono perfil:</span>{" "}
              {selectedPatient.userPhone || "Sin dato"}
            </p>
          </div>
        )}
      </div>

      {selectedPatientId && (
        <>
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-5"
          >
            <div>
              <h4 className="text-lg font-bold text-gray-800">
                Ficha de ingreso del paciente
              </h4>
              <p className="text-gray-400 text-[11px]">
                Datos base de historia clínica. Se guarda en clinical_profiles.
              </p>
            </div>

            {isLoadingProfile ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-400">
                Cargando ficha clínica...
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Fecha de ingreso
                    <input
                      type="date"
                      value={profileForm.intakeDate}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          intakeDate: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Nombre y apellido
                    <input
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    CI
                    <input
                      value={profileForm.documentId}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          documentId: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Fecha de nacimiento
                    <input
                      type="date"
                      value={profileForm.birthDate}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          birthDate: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Teléfono
                    <input
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Email
                    <input
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Ocupación
                    <input
                      value={profileForm.occupation}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          occupation: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Contacto de emergencia
                    <input
                      value={profileForm.emergencyContactName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          emergencyContactName: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Teléfono emergencia
                  <input
                    value={profileForm.emergencyContactPhone}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Motivo principal de consulta
                  <textarea
                    value={profileForm.chiefComplaint}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        chiefComplaint: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                  />
                </label>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">
                    Zona de dolor o molestia
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {painZoneOptions.map((zone) => (
                      <label
                        key={zone.value}
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={profileForm.painZones.includes(zone.value)}
                          onChange={() => togglePainZone(zone.value)}
                        />
                        <span>{zone.label}</span>
                      </label>
                    ))}
                  </div>

                  {profileForm.painZones.includes("other") && (
                    <input
                      value={profileForm.painZoneOther}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          painZoneOther: e.target.value,
                        })
                      }
                      placeholder="Especifica otro"
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Tiempo de evolución
                    <select
                      value={profileForm.painDurationUnit}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          painDurationUnit: e.target.value as
                            | PainDurationUnit
                            | "",
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    >
                      <option value="">Selecciona...</option>
                      <option value="days">Días</option>
                      <option value="weeks">Semanas</option>
                      <option value="months">Meses</option>
                      <option value="years">Años</option>
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Intensidad dolor (0-10)
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={profileForm.painIntensity}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          painIntensity: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    ¿Qué lo empeora?
                    <textarea
                      value={profileForm.worseFactors}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          worseFactors: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    ¿Qué lo alivia?
                    <textarea
                      value={profileForm.reliefFactors}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          reliefFactors: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">
                    Antecedentes de salud
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={profileForm.hypertension}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            hypertension: e.target.checked,
                          })
                        }
                      />
                      Hipertensión
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={profileForm.diabetes}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            diabetes: e.target.checked,
                          })
                        }
                      />
                      Diabetes
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={profileForm.heartProblems}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            heartProblems: e.target.checked,
                          })
                        }
                      />
                      Problemas cardíacos
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={profileForm.osteoporosis}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            osteoporosis: e.target.checked,
                          })
                        }
                      />
                      Osteoporosis
                    </label>
                  </div>

                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Patologías
                    <textarea
                      value={profileForm.pathologies}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          pathologies: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-gray-600">
                      Cirugías previas
                      <textarea
                        value={profileForm.surgeries}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            surgeries: e.target.value,
                          })
                        }
                        className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-gray-600">
                      Accidentes / traumatismos
                      <textarea
                        value={profileForm.accidents}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            accidents: e.target.value,
                          })
                        }
                        className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                      />
                    </label>
                  </div>

                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Medicación actual
                    <textarea
                      value={profileForm.currentMedication}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          currentMedication: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Diagnóstico inicial
                    <textarea
                      value={profileForm.initialDiagnosis}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          initialDiagnosis: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[90px] resize-none"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-600">
                    Fecha inicio tratamiento
                    <input
                      type="date"
                      value={profileForm.treatmentStartDate}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          treatmentStartDate: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    />
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSavingProfile || isLoadingProfile}
              className={`w-full py-4 rounded-3xl text-white font-bold transition ${isSavingProfile || isLoadingProfile ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"}`}
            >
              {isSavingProfile ? "Guardando ficha..." : "Guardar ficha ingreso"}
            </button>
          </form>

          <form
            onSubmit={handleSaveSession}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-5"
          >
            <div>
              <h4 className="text-lg font-bold text-gray-800">
                Hoja de evolución del tratamiento
              </h4>
              <p className="text-gray-400 text-[11px]">
                Registro clínico por sesión. Se guarda en clinical_sessions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-gray-600 sm:col-span-2">
                Turno relacionado (opcional)
                <select
                  value={sessionForm.appointmentId}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      appointmentId: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                >
                  <option value="">Sin vincular a turno</option>
                  {patientAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.date} {appointment.time} -{" "}
                      {appointment.serviceName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Fecha sesión
                <input
                  type="date"
                  value={sessionForm.sessionDate}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      sessionDate: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-gray-600">
              Dolor de sesión (0-10)
              <input
                type="number"
                min="0"
                max="10"
                value={sessionForm.painLevel}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    painLevel: e.target.value,
                  })
                }
                className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-600">
              Observaciones clínicas
              <textarea
                value={sessionForm.clinicalObservations}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    clinicalObservations: e.target.value,
                  })
                }
                className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[100px] resize-none"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-600">
                Técnicas aplicadas
                <textarea
                  value={sessionForm.techniquesApplied}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      techniquesApplied: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[100px] resize-none"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Recomendaciones
                <textarea
                  value={sessionForm.recommendations}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      recommendations: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[100px] resize-none"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingSession}
              className={`w-full py-4 rounded-3xl text-white font-bold transition ${isSavingSession ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"}`}
            >
              {isSavingSession ? "Guardando evolución..." : "Guardar evolución"}
            </button>
          </form>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-gray-800">
                Sesiones registradas
              </h4>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {clinicalSessions.length} cargadas
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-600">
                Buscar en sesiones cargadas
                <input
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Fecha, observaciones, técnicas o recomendaciones"
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Filtro por nivel de dolor
                <select
                  value={sessionPainFilter}
                  onChange={(e) =>
                    setSessionPainFilter(
                      e.target.value as "all" | "low" | "medium" | "high",
                    )
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                >
                  <option value="all">Todos</option>
                  <option value="low">Bajo (0-3)</option>
                  <option value="medium">Medio (4-6)</option>
                  <option value="high">Alto (7-10)</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Fecha desde
                <input
                  type="date"
                  value={sessionDateFrom}
                  onChange={(e) => setSessionDateFrom(e.target.value)}
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Fecha hasta
                <input
                  type="date"
                  value={sessionDateTo}
                  onChange={(e) => setSessionDateTo(e.target.value)}
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                setSessionSearch("");
                setSessionPainFilter("all");
                setSessionDateFrom("");
                setSessionDateTo("");
              }}
              disabled={
                !sessionSearch &&
                sessionPainFilter === "all" &&
                !sessionDateFrom &&
                !sessionDateTo
              }
              className={`w-full py-3 rounded-3xl border text-sm font-bold transition ${
                !sessionSearch &&
                sessionPainFilter === "all" &&
                !sessionDateFrom &&
                !sessionDateTo
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900"
              }`}
            >
              Limpiar filtros
            </button>

            {isLoadingSessions ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-400">
                Cargando sesiones...
              </div>
            ) : clinicalSessions.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 p-8 text-center text-sm font-bold text-gray-300">
                No hay evolución registrada todavía para este paciente.
              </div>
            ) : visibleClinicalSessions.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-500">
                No hay sesiones cargadas que coincidan con los filtros.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleClinicalSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-3xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-gray-800">
                          Sesión {session.sessionNumber || "-"} -{" "}
                          {session.sessionDate}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Dolor: {session.painLevel}/10
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="px-3 py-2 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100"
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          Observaciones
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {session.clinicalObservations}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          Técnicas
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {session.techniquesApplied}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          Recomendaciones
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {session.recommendations}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingSessions && hasMoreSessions && (
              <button
                type="button"
                onClick={handleLoadMoreSessions}
                disabled={isLoadingMoreSessions}
                className={`w-full py-3 rounded-3xl border text-sm font-bold transition ${
                  isLoadingMoreSessions
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900"
                }`}
              >
                {isLoadingMoreSessions
                  ? "Cargando más sesiones..."
                  : "Cargar más sesiones"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClinicalRecordsPanel;
