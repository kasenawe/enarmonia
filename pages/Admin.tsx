import React, { useEffect, useMemo, useState } from "react";
import {
  Appointment,
  AppUser,
  BlockedSlot,
  Promotion,
  PromotionDiscountType,
  Service,
} from "../types";
import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
} from "../firebase";
import { BACKEND_URL } from "../constants";
import { getServicePricing } from "../utils/promotionPricing";
import { useAuth } from "../contexts/AuthContext";
import ClinicalRecordsPanel from "../components/ClinicalRecordsPanel";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface AdminProps {
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  services: Service[];
  servicesLoading: boolean;
  serviceError: string | null;
  promotions: Promotion[];
  promotionsLoading: boolean;
  promotionError: string | null;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
}

const Admin: React.FC<AdminProps> = ({
  appointments,
  blockedSlots,
  services,
  servicesLoading,
  serviceError,
  promotions,
  promotionsLoading,
  promotionError,
  onDelete,
  onBack,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "appointments"
    | "blockedSlots"
    | "services"
    | "promotions"
    | "users"
    | "clinical"
  >("appointments");

  // Función helper para obtener fecha local en formato YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [blockDate, setBlockDate] = useState(getLocalDateString());
  const [blockTime, setBlockTime] = useState("09:00");
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockFeedback, setBlockFeedback] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    duration: "45",
    price: "2500",
    imageUrl: "",
  });
  const [serviceFormError, setServiceFormError] = useState("");
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);
  const [isServiceSaving, setIsServiceSaving] = useState(false);
  const [selectedPromotionFile, setSelectedPromotionFile] =
    useState<File | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotionForm, setPromotionForm] = useState({
    title: "",
    description: "",
    badgeText: "",
    discountType: "percentage" as PromotionDiscountType,
    discountValue: "15",
    startDate: "",
    endDate: "",
    imageUrl: "",
    featured: true,
    isActive: true,
    appliesToAllServices: true,
    serviceIds: [] as string[],
    priority: "100",
  });
  const [promotionFormError, setPromotionFormError] = useState("");
  const [promotionFeedback, setPromotionFeedback] = useState<string | null>(
    null,
  );
  const [isPromotionSaving, setIsPromotionSaving] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [demotingUserId, setDemotingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<
    "all" | "today" | "upcoming" | "past"
  >("upcoming");
  const [bookingModeFilter, setBookingModeFilter] = useState<
    "all" | "account" | "guest"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [visibleAppointments, setVisibleAppointments] = useState(20);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContactApp, setSelectedContactApp] =
    useState<Appointment | null>(null);

  const blockTimeOptions = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setUsersError(null);
      setUsersLoading(false);
      return;
    }

    setUsersLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const loadedUsers: AppUser[] = [];
        snapshot.forEach((entry) => {
          loadedUsers.push({ uid: entry.id, ...entry.data() } as AppUser);
        });

        loadedUsers.sort((a, b) =>
          (a.email || "").localeCompare(b.email || ""),
        );
        setUsers(loadedUsers);
        setUsersError(null);
        setUsersLoading(false);
      },
      (snapshotError) => {
        console.error(snapshotError);
        setUsersError(
          "No se pudo cargar la lista de usuarios. Verifica que tu cuenta tenga rol admin.",
        );
        setUsersLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = () => {
    onBack();
  };

  const isPromotionLive = (promotion: Promotion) => {
    if (!promotion.isActive) return false;
    const now = new Date();
    const startDate = promotion.startDate
      ? new Date(`${promotion.startDate}T00:00:00`)
      : null;
    const endDate = promotion.endDate
      ? new Date(`${promotion.endDate}T23:59:59`)
      : null;

    if (startDate && startDate > now) return false;
    if (endDate && endDate < now) return false;
    return true;
  };

  const getPromotionDiscountLabel = (promotion: {
    discountType: PromotionDiscountType;
    discountValue: number;
  }) => {
    return promotion.discountType === "percentage"
      ? `${promotion.discountValue}% OFF`
      : `$${promotion.discountValue.toLocaleString("es-UY")} OFF`;
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setSelectedFile(null);
    setServiceForm({
      name: "",
      description: "",
      duration: "45",
      price: "2500",
      imageUrl: "",
    });
    setServiceFormError("");
    setServiceFeedback(null);
  };

  const resetPromotionForm = () => {
    setEditingPromotion(null);
    setSelectedPromotionFile(null);
    setPromotionForm({
      title: "",
      description: "",
      badgeText: "",
      discountType: "percentage",
      discountValue: "15",
      startDate: "",
      endDate: "",
      imageUrl: "",
      featured: true,
      isActive: true,
      appliesToAllServices: true,
      serviceIds: [],
      priority: "100",
    });
    setPromotionFormError("");
    setPromotionFeedback(null);
  };

  const uploadServiceImage = async (file: File, serviceId: string) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("CLOUDINARY_CONFIG_MISSING");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `enarmonia/services/${serviceId}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`CLOUDINARY_UPLOAD_ERROR: ${details}`);
    }

    const uploaded = await response.json();
    if (!uploaded?.secure_url) {
      throw new Error("CLOUDINARY_NO_SECURE_URL");
    }

    return uploaded.secure_url as string;
  };

  const uploadPromotionImage = async (file: File, promotionId: string) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("CLOUDINARY_CONFIG_MISSING");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `enarmonia/promotions/${promotionId}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`CLOUDINARY_UPLOAD_ERROR: ${details}`);
    }

    const uploaded = await response.json();
    if (!uploaded?.secure_url) {
      throw new Error("CLOUDINARY_NO_SECURE_URL");
    }

    return uploaded.secure_url as string;
  };

  const handleEditService = (service: Service) => {
    setActiveTab("services");
    setEditingService(service);
    setSelectedFile(null);
    setServiceForm({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
      imageUrl: service.image,
    });
    setServiceFormError("");
    setServiceFeedback(null);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setActiveTab("promotions");
    setEditingPromotion(promotion);
    setSelectedPromotionFile(null);
    setPromotionForm({
      title: promotion.title,
      description: promotion.description,
      badgeText: promotion.badgeText,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      startDate: promotion.startDate || "",
      endDate: promotion.endDate || "",
      imageUrl: promotion.image,
      featured: promotion.featured,
      isActive: promotion.isActive,
      appliesToAllServices: promotion.appliesToAllServices,
      serviceIds: promotion.serviceIds || [],
      priority: (promotion.priority || 0).toString(),
    });
    setPromotionFormError("");
    setPromotionFeedback(null);
  };

  const togglePromotionService = (serviceId: string) => {
    setPromotionForm((current) => {
      const isSelected = current.serviceIds.includes(serviceId);
      return {
        ...current,
        serviceIds: isSelected
          ? current.serviceIds.filter((id) => id !== serviceId)
          : [...current.serviceIds, serviceId],
      };
    });
  };

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = serviceForm.name.trim();
    const description = serviceForm.description.trim();
    const duration = Number(serviceForm.duration);
    const price = Number(serviceForm.price);

    if (!name || !description || duration <= 0 || price <= 0) {
      setServiceFormError(
        "Completa todos los datos del servicio correctamente.",
      );
      return;
    }

    setIsServiceSaving(true);
    setServiceFormError("");
    setServiceFeedback(null);

    try {
      let serviceId = editingService?.id;
      if (!serviceId) {
        const newServiceDoc = doc(collection(db, "services"));
        serviceId = newServiceDoc.id;
      }

      let imageUrl = serviceForm.imageUrl;
      if (selectedFile && serviceId) {
        imageUrl = await uploadServiceImage(selectedFile, serviceId);
      }

      const serviceRecord = {
        id: serviceId,
        name,
        description,
        duration,
        price,
        image: imageUrl,
      };

      await setDoc(doc(db, "services", serviceId), serviceRecord, {
        merge: true,
      });
      setServiceFeedback(
        editingService
          ? "Servicio actualizado con éxito."
          : "Servicio creado correctamente.",
      );
      resetServiceForm();
    } catch (uploadError: any) {
      console.error(uploadError);
      const rawMessage = String(uploadError?.message || "").toLowerCase();
      if (rawMessage.includes("cloudinary_config_missing")) {
        setServiceFormError(
          "Falta configurar Cloudinary. Define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.",
        );
      } else {
        setServiceFormError(
          "Hubo un error al guardar el servicio. Intenta nuevamente.",
        );
      }
    } finally {
      setIsServiceSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("¿Eliminar este servicio de forma permanente?")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      if (editingService?.id === id) resetServiceForm();
    } catch (deleteError) {
      console.error(deleteError);
      setServiceFormError(
        "No se pudo eliminar el servicio. Intenta nuevamente.",
      );
    }
  };

  const handlePromotionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = promotionForm.title.trim();
    const description = promotionForm.description.trim();
    const badgeText = promotionForm.badgeText.trim();
    const discountValue = Number(promotionForm.discountValue);
    const priority = Number(promotionForm.priority);

    if (
      !title ||
      !description ||
      discountValue <= 0 ||
      !Number.isFinite(priority)
    ) {
      setPromotionFormError(
        "Completa correctamente el título, descripción, descuento y prioridad.",
      );
      return;
    }

    if (
      promotionForm.startDate &&
      promotionForm.endDate &&
      new Date(`${promotionForm.endDate}T00:00:00`) <
        new Date(`${promotionForm.startDate}T00:00:00`)
    ) {
      setPromotionFormError(
        "La fecha de finalización no puede ser anterior a la fecha de inicio.",
      );
      return;
    }

    if (
      !promotionForm.appliesToAllServices &&
      promotionForm.serviceIds.length === 0
    ) {
      setPromotionFormError(
        "Selecciona al menos un servicio o marca que la promoción aplica a todo el catálogo.",
      );
      return;
    }

    setIsPromotionSaving(true);
    setPromotionFormError("");
    setPromotionFeedback(null);

    try {
      let promotionId = editingPromotion?.id;
      if (!promotionId) {
        const newPromotionDoc = doc(collection(db, "promotions"));
        promotionId = newPromotionDoc.id;
      }

      let imageUrl = promotionForm.imageUrl;
      if (selectedPromotionFile && promotionId) {
        imageUrl = await uploadPromotionImage(
          selectedPromotionFile,
          promotionId,
        );
      }

      const promotionRecord = {
        id: promotionId,
        title,
        description,
        badgeText:
          badgeText ||
          getPromotionDiscountLabel({
            discountType: promotionForm.discountType,
            discountValue,
          }),
        discountType: promotionForm.discountType,
        discountValue,
        image: imageUrl,
        featured: promotionForm.featured,
        isActive: promotionForm.isActive,
        appliesToAllServices: promotionForm.appliesToAllServices,
        serviceIds: promotionForm.appliesToAllServices
          ? []
          : promotionForm.serviceIds,
        startDate: promotionForm.startDate,
        endDate: promotionForm.endDate,
        priority,
        createdAt: editingPromotion?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "promotions", promotionId), promotionRecord, {
        merge: true,
      });
      setPromotionFeedback(
        editingPromotion
          ? "Promoción actualizada con éxito."
          : "Promoción creada correctamente.",
      );
      resetPromotionForm();
    } catch (uploadError: any) {
      console.error(uploadError);
      const rawMessage = String(uploadError?.message || "").toLowerCase();
      if (rawMessage.includes("cloudinary_config_missing")) {
        setPromotionFormError(
          "Falta configurar Cloudinary. Define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.",
        );
      } else {
        setPromotionFormError(
          "Hubo un error al guardar la promoción. Intenta nuevamente.",
        );
      }
    } finally {
      setIsPromotionSaving(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!window.confirm("¿Eliminar esta promoción de forma permanente?"))
      return;
    try {
      await deleteDoc(doc(db, "promotions", id));
      if (editingPromotion?.id === id) resetPromotionForm();
    } catch (deleteError) {
      console.error(deleteError);
      setPromotionFormError(
        "No se pudo eliminar la promoción. Intenta nuevamente.",
      );
    }
  };

  const handlePromoteUser = async (userId: string) => {
    if (!currentUser) {
      setUsersError(
        "Debes iniciar sesión con una cuenta admin para promover usuarios.",
      );
      return;
    }

    setUsersError(null);
    setUserFeedback(null);
    setPromotingUserId(userId);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/promote-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo promover el usuario.");
      }

      setUserFeedback("Usuario promovido a administrador correctamente.");
    } catch (promoteError: any) {
      console.error(promoteError);
      setUsersError(promoteError?.message || "No se pudo promover el usuario.");
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!currentUser) {
      setUsersError(
        "Debes iniciar sesión con una cuenta admin para eliminar usuarios.",
      );
      return;
    }

    if (currentUser.uid === userId) {
      setUsersError("No puedes darte de baja a ti misma.");
      return;
    }

    if (
      !window.confirm(
        `¿Dar de baja a ${userEmail}?\n\nEsto eliminará la cuenta, el perfil y la historia clínica del usuario. Las citas históricas se conservan.\n\nEsta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setUsersError(null);
    setUserFeedback(null);
    setDeletingUserId(userId);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo dar de baja al usuario.");
      }

      setUserFeedback(`Usuario ${userEmail} dado de baja correctamente.`);
    } catch (deleteError: any) {
      console.error(deleteError);
      setUsersError(
        deleteError?.message || "No se pudo dar de baja al usuario.",
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDemoteUser = async (userId: string) => {
    if (!currentUser) {
      setUsersError(
        "Debes iniciar sesión con una cuenta admin para modificar usuarios.",
      );
      return;
    }

    if (currentUser.uid === userId) {
      setUsersError("No puedes quitarte a ti misma el rol admin.");
      return;
    }

    if (!window.confirm("¿Quitar permisos de administrador a este usuario?")) {
      return;
    }

    setUsersError(null);
    setUserFeedback(null);
    setDemotingUserId(userId);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/demote-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.error || "No se pudo quitar el rol admin al usuario.",
        );
      }

      setUserFeedback("Permisos de administrador quitados correctamente.");
    } catch (demoteError: any) {
      console.error(demoteError);
      setUsersError(
        demoteError?.message || "No se pudo quitar el rol admin al usuario.",
      );
    } finally {
      setDemotingUserId(null);
    }
  };

  const sortedBlockedSlots = [...blockedSlots].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.time.localeCompare(b.time);
  });

  const isBlockedSlot = (date: string, time: string) => {
    return blockedSlots.some(
      (slot) => slot.date === date && slot.time === time,
    );
  };

  const hasAppointmentAtSlot = (date: string, time: string) => {
    return appointments.some(
      (appointment) => appointment.date === date && appointment.time === time,
    );
  };

  const handleBlockSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBlockError(null);
    setBlockFeedback(null);

    if (!blockDate || !blockTime) {
      setBlockError("Selecciona una fecha y un horario para bloquear.");
      return;
    }

    if (isBlockedSlot(blockDate, blockTime)) {
      setBlockError("Ese horario ya está bloqueado manualmente.");
      return;
    }

    if (hasAppointmentAtSlot(blockDate, blockTime)) {
      setBlockError(
        "No se puede bloquear ese horario porque ya existe un turno agendado.",
      );
      return;
    }

    setIsBlocking(true);
    try {
      await addDoc(collection(db, "blocked_slots"), {
        date: blockDate,
        time: blockTime,
        createdAt: new Date().toISOString(),
      });
      setBlockFeedback("Horario bloqueado correctamente.");
    } catch (blockError) {
      console.error(blockError);
      setBlockError("No se pudo bloquear el horario. Intenta nuevamente.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockSlot = async (id: string) => {
    if (!window.confirm("¿Eliminar este bloqueo manual?")) return;

    setBlockError(null);
    setBlockFeedback(null);
    try {
      await deleteDoc(doc(db, "blocked_slots", id));
      setBlockFeedback("Bloqueo eliminado correctamente.");
    } catch (blockError) {
      console.error(blockError);
      setBlockError("No se pudo eliminar el bloqueo.");
    }
  };

  // Usar fecha local, no UTC, para que coincida con como se guardan los appointments
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return a.time.localeCompare(b.time);
  });

  const filteredAppointments = useMemo(() => {
    const search = appointmentSearch.trim().toLowerCase();

    return sortedAppointments.filter((appointment) => {
      if (appointmentStatusFilter === "today" && appointment.date !== today) {
        return false;
      }

      if (appointmentStatusFilter === "upcoming" && appointment.date < today) {
        return false;
      }

      if (appointmentStatusFilter === "past" && appointment.date >= today) {
        return false;
      }

      if (
        bookingModeFilter !== "all" &&
        (appointment.bookingMode || "account") !== bookingModeFilter
      ) {
        return false;
      }

      if (paymentFilter === "paid" && !appointment.paid) {
        return false;
      }

      if (paymentFilter === "unpaid" && appointment.paid) {
        return false;
      }

      if (dateFromFilter && appointment.date < dateFromFilter) {
        return false;
      }

      if (dateToFilter && appointment.date > dateToFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableText = [
        appointment.userName,
        appointment.userPhone,
        appointment.userEmail,
        appointment.serviceName,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [
    sortedAppointments,
    appointmentSearch,
    appointmentStatusFilter,
    bookingModeFilter,
    paymentFilter,
    dateFromFilter,
    dateToFilter,
    today,
  ]);

  const paginatedAppointments = filteredAppointments.slice(
    0,
    visibleAppointments,
  );
  const hasMoreAppointments =
    paginatedAppointments.length < filteredAppointments.length;

  useEffect(() => {
    setVisibleAppointments(20);
  }, [
    activeTab,
    appointmentSearch,
    appointmentStatusFilter,
    bookingModeFilter,
    paymentFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  const todayCount = appointments.filter((a) => a.date === today).length;

  return (
    <div className="p-6 pb-24 animate-in min-h-screen bg-gray-50">
      <header className="mb-8 pt-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M18 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 font-serif leading-tight">
              Agenda
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Soledad Cedres Quiropráctica
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white p-3 rounded-2xl text-gray-400 border border-gray-100 shadow-sm active:scale-90 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            Para Hoy
          </span>
          <span className="text-2xl font-black text-brand">{todayCount}</span>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            Total Agenda
          </span>
          <span className="text-2xl font-black text-gray-800">
            {appointments.length}
          </span>
        </div>
      </div>

      <section className="mt-12 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Panel de gestión
            </h3>
            <p className="text-gray-400 text-[11px]">
              Turnos, bloqueos, servicios, promociones, usuarios e historia
              clínica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === "appointments" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Turnos
            </button>
            <button
              onClick={() => setActiveTab("blockedSlots")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === "blockedSlots" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Bloqueos
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === "services" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Servicios
            </button>
            <button
              onClick={() => setActiveTab("promotions")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === "promotions" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Promociones
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === "users" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("clinical")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${activeTab === "clinical" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Historia clínica
            </button>
          </div>
        </div>

        {activeTab === "appointments" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, email o servicio"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
                <select
                  value={appointmentStatusFilter}
                  onChange={(e) =>
                    setAppointmentStatusFilter(
                      e.target.value as "all" | "today" | "upcoming" | "past",
                    )
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900"
                >
                  <option value="all">Estado temporal: Todos</option>
                  <option value="today">Solo hoy</option>
                  <option value="upcoming">Próximos (incluye hoy)</option>
                  <option value="past">Pasados</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <select
                  value={bookingModeFilter}
                  onChange={(e) =>
                    setBookingModeFilter(
                      e.target.value as "all" | "account" | "guest",
                    )
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900"
                >
                  <option value="all">Modo: Todos</option>
                  <option value="account">Solo Cuenta</option>
                  <option value="guest">Solo Invitado</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) =>
                    setPaymentFilter(
                      e.target.value as "all" | "paid" | "unpaid",
                    )
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900"
                >
                  <option value="all">Pago: Todos</option>
                  <option value="paid">Pagados</option>
                  <option value="unpaid">Sin pago</option>
                </select>

                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />

                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {filteredAppointments.length} resultado(s)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentSearch("");
                    setAppointmentStatusFilter("upcoming");
                    setBookingModeFilter("all");
                    setPaymentFilter("all");
                    setDateFromFilter("");
                    setDateToFilter("");
                  }}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {paginatedAppointments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-bold text-sm">
                  No hay turnos para los filtros seleccionados.
                </p>
              </div>
            ) : (
              paginatedAppointments.map((app, idx) => {
                const isToday = app.date === today;
                return (
                  <div
                    key={app.id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm relative overflow-hidden transition-all ${isToday ? "border-outline-strong ring-2 ring-surface" : "border-transparent"}`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${isToday ? "bg-brand-accent text-white" : "bg-gray-100 text-gray-500"}`}
                          >
                            {app.date}
                          </span>
                          {isToday && (
                            <span className="text-[8px] font-black text-brand uppercase animate-pulse">
                              ¡Hoy!
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800 text-base leading-tight">
                          {app.serviceName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2 text-gray-400 justify-between">
                          <div className="flex items-center gap-1.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="text-xs font-bold text-gray-600">
                              {app.userName}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedContactApp(app);
                              setShowContactModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
                            title="Ver información de contacto"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span
                            className={`text-[9px] font-bold px-2 py-1 rounded-full ${app.paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {app.paid ? "Pagado ✓" : "Sin Pago"}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                              app.bookingMode === "guest"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-[#f0f7f4] text-[#2d6a4f]"
                            }`}
                          >
                            {app.bookingMode === "guest"
                              ? "Invitado"
                              : "Cuenta"}
                          </span>
                          {app.appliedPromotion && (
                            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-rose-100 text-rose-600">
                              {app.appliedPromotion.badgeText ||
                                app.appliedPromotion.title}
                            </span>
                          )}
                          {app.price && (
                            <span className="text-[9px] font-bold text-gray-500">
                              ${app.price.toLocaleString("es-UY")}
                            </span>
                          )}
                        </div>
                        {(app.basePrice || app.discountAmount) && (
                          <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-3 grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Base
                              </p>
                              <p className="font-bold text-gray-700">
                                $
                                {(app.basePrice || app.price)?.toLocaleString(
                                  "es-UY",
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Desc.
                              </p>
                              <p className="font-bold text-rose-600">
                                -$
                                {(app.discountAmount || 0).toLocaleString(
                                  "es-UY",
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Total
                              </p>
                              <p className="font-black text-gray-900">
                                ${app.price?.toLocaleString("es-UY")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900 leading-none mb-1">
                          {app.time}
                        </p>
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                          HS
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 mt-2 border-t border-gray-50">
                      <a
                        href={`https://wa.me/${app.userPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-green-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1" />
                          <path d="M10 14.7 9 22l11-11-4.7-1" />
                        </svg>
                        WhatsApp
                      </a>
                      <button
                        onClick={() => onDelete(app.id)}
                        className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100 active:scale-95 transition-all border border-red-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {hasMoreAppointments && (
              <button
                type="button"
                onClick={() => setVisibleAppointments((prev) => prev + 20)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 text-sm font-bold text-gray-700"
              >
                Cargar 20 más
              </button>
            )}

            {/* Contact Details Modal */}
            {showContactModal && selectedContactApp && (
              <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedContactApp(null);
                }}
              >
                <div 
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-gray-100 p-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">
                      Información de contacto
                    </h3>
                    <button
                      onClick={() => {
                        setShowContactModal(false);
                        setSelectedContactApp(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Nombre
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedContactApp.userName}
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Teléfono
                      </p>
                      <a
                        href={`https://wa.me/${selectedContactApp.userPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1.5 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {selectedContactApp.userPhone}
                      </a>
                    </div>

                    {/* Email */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Correo electrónico
                      </p>
                      <a
                        href={`mailto:${selectedContactApp.userEmail}`}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition break-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        {selectedContactApp.userEmail}
                      </a>
                    </div>

                    {/* Document ID */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Documento
                      </p>
                      <p className="text-sm font-mono text-gray-700">
                        {selectedContactApp.bookingMode === "account" && selectedContactApp.userId
                          ? "Ver en Historia clínica"
                          : selectedContactApp.bookingMode === "guest"
                            ? "No proporcionado"
                            : "-"}
                      </p>
                    </div>

                    {/* Booking Mode */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Tipo de reserva
                      </p>
                      <span
                        className={`inline-block text-[9px] font-bold px-2.5 py-1 rounded-full ${
                          selectedContactApp.bookingMode === "guest"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#f0f7f4] text-[#2d6a4f]"
                        }`}
                      >
                        {selectedContactApp.bookingMode === "guest"
                          ? "Invitado (sin cuenta)"
                          : "Cuenta registrada"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-6 flex gap-2">
                    <a
                      href={`https://wa.me/${selectedContactApp.userPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-green-100 hover:bg-green-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7l.8.1" />
                        <path d="M10 14.7 9 22l11-11-4.7-1" />
                      </svg>
                      WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setShowContactModal(false);
                        setSelectedContactApp(null);
                      }}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl text-[10px] font-bold uppercase transition-all hover:bg-gray-200 active:scale-95"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "blockedSlots" && (
          <div className="space-y-6">
            {blockError && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
                {blockError}
              </div>
            )}
            {blockFeedback && (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm">
                {blockFeedback}
              </div>
            )}

            <form
              onSubmit={handleBlockSlot}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-5"
            >
              <div>
                <h4 className="text-lg font-bold text-gray-800">
                  Bloqueo manual de horarios
                </h4>
                <p className="text-gray-400 text-[11px]">
                  El horario dejará de aparecer como disponible en reservas.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Fecha
                  <input
                    type="date"
                    min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Hora
                  <select
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                  >
                    {blockTimeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={isBlocking}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all disabled:opacity-40"
              >
                {isBlocking ? "BLOQUEANDO..." : "BLOQUEAR HORARIO"}
              </button>
            </form>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    Horarios bloqueados
                  </h4>
                  <p className="text-gray-400 text-[11px]">
                    Lista simple de bloqueos manuales activos.
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {sortedBlockedSlots.length} activos
                </span>
              </div>

              {sortedBlockedSlots.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50 py-12 text-center text-sm font-bold text-gray-300">
                  No hay bloqueos cargados.
                </div>
              ) : (
                sortedBlockedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {slot.date}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {slot.time} hs
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnblockSlot(slot.id)}
                      className="px-4 py-2 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100"
                    >
                      Desbloquear
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {usersError && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
                {usersError}
              </div>
            )}
            {userFeedback && (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm">
                {userFeedback}
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">
                  Usuarios administradores
                </h4>
                <p className="text-gray-400 text-[11px]">
                  Promueve usuarios existentes a admin usando el endpoint
                  protegido del backend.
                </p>
              </div>

              {!currentUser ? (
                <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5 text-sm text-amber-700">
                  Debes iniciar sesión con una cuenta Firebase que ya sea admin
                  para gestionar otros administradores.
                </div>
              ) : usersLoading ? (
                <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 text-center text-gray-400">
                  Cargando usuarios...
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 text-center text-gray-400">
                  No hay usuarios disponibles.
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => {
                    const isUserAdmin = user.role === "admin";
                    const isCurrentUser = currentUser?.uid === user.uid;
                    const displayName = user.fullName?.trim() || "Sin nombre";
                    const displayDocument =
                      user.documentId?.trim() || "Sin documento";
                    const displayEmail = user.email?.trim() || user.uid;

                    return (
                      <div
                        key={user.uid}
                        className="flex items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-800">
                            {displayName}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            Doc: {displayDocument}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {displayEmail}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${isUserAdmin ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}
                            >
                              {user.role}
                            </span>
                            <span className="truncate text-[10px] font-medium text-gray-400">
                              {user.uid}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          {isUserAdmin ? (
                            <button
                              onClick={() => handleDemoteUser(user.uid)}
                              disabled={
                                isCurrentUser || demotingUserId === user.uid
                              }
                              className={`rounded-2xl border px-4 py-2 text-xs font-bold transition-all ${isCurrentUser ? "cursor-not-allowed border-emerald-100 bg-emerald-50 text-emerald-700 opacity-70" : "border-red-100 bg-red-50 text-red-600 active:scale-95 disabled:opacity-40"}`}
                            >
                              {isCurrentUser
                                ? "Tu cuenta admin"
                                : demotingUserId === user.uid
                                  ? "Quitando..."
                                  : "Quitar admin"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePromoteUser(user.uid)}
                              disabled={promotingUserId === user.uid}
                              className="rounded-2xl border border-gray-900 bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                            >
                              {promotingUserId === user.uid
                                ? "Promoviendo..."
                                : "Hacer admin"}
                            </button>
                          )}
                          {!isCurrentUser && (
                            <button
                              onClick={() =>
                                handleDeleteUser(user.uid, user.email)
                              }
                              disabled={deletingUserId === user.uid}
                              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-all active:scale-95 disabled:opacity-40"
                            >
                              {deletingUserId === user.uid
                                ? "Eliminando..."
                                : "Dar de baja"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "clinical" && (
          <ClinicalRecordsPanel
            users={users}
            appointments={appointments}
            currentAdminUid={currentUser?.uid || null}
          />
        )}

        {activeTab === "services" && (
          <div className="space-y-6">
            {serviceError && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
                {serviceError}
              </div>
            )}
            {serviceFormError && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
                {serviceFormError}
              </div>
            )}
            {serviceFeedback && (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm">
                {serviceFeedback}
              </div>
            )}

            <div className="grid gap-4">
              {servicesLoading ? (
                <div className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-sm text-center text-gray-400">
                  Cargando servicios...
                </div>
              ) : services.length === 0 ? (
                <div className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-sm text-center text-gray-400">
                  No hay servicios cargados aún.
                </div>
              ) : (
                services.map((service) => {
                  const pricing = getServicePricing(service, promotions);

                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-800">
                              {service.name}
                            </h4>
                            {pricing.appliedPromotion && (
                              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600">
                                {pricing.appliedPromotion.badgeText ||
                                  pricing.appliedPromotion.title}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-[11px] line-clamp-2 mt-1">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-2">
                            Duración
                          </p>
                          <p className="font-black text-gray-900">
                            {service.duration} min
                          </p>
                        </div>
                      </div>
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-44 object-cover rounded-3xl border border-gray-100"
                        />
                      )}
                      <div className="flex flex-wrap items-center gap-3 justify-between">
                        <div>
                          {pricing.appliedPromotion ? (
                            <div>
                              <p className="text-[11px] font-bold text-gray-300 line-through">
                                ${pricing.basePrice.toLocaleString("es-UY")}
                              </p>
                              <p className="text-sm font-black text-rose-600">
                                ${pricing.finalPrice.toLocaleString("es-UY")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm font-black text-brand">
                              ${pricing.basePrice.toLocaleString("es-UY")}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="px-4 py-2 rounded-2xl bg-gray-900 text-white text-xs font-bold"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="px-4 py-2 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleServiceSubmit}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {editingService ? "Editar servicio" : "Nuevo servicio"}
                  </h4>
                  <p className="text-gray-400 text-[11px]">
                    Carga los datos y la imagen del servicio. El catálogo se
                    guardará en Firestore.
                  </p>
                </div>
                {editingService && (
                  <button
                    type="button"
                    onClick={resetServiceForm}
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Nombre del servicio
                  <input
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="Ej: Ajuste quiropráctico inicial"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Precio (UYU)
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="2500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Duración (minutos)
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        duration: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="45"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  URL de imagen
                  <input
                    value={serviceForm.imageUrl}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600"
                />
                <p className="text-[11px] text-gray-400">
                  Si subes una imagen, esta reemplazará la URL anterior.
                </p>
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Descripción
                <textarea
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[120px] resize-none"
                  placeholder="Descripción detallada del servicio"
                />
              </label>

              <button
                type="submit"
                disabled={isServiceSaving}
                className={`w-full py-4 rounded-3xl text-white font-bold transition ${isServiceSaving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"}`}
              >
                {isServiceSaving
                  ? "Guardando servicio..."
                  : editingService
                    ? "Actualizar servicio"
                    : "Crear servicio"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "promotions" && (
          <div className="space-y-6">
            {promotionError && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
                {promotionError}
              </div>
            )}
            {promotionFormError && (
              <div className="rounded-3xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
                {promotionFormError}
              </div>
            )}
            {promotionFeedback && (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm">
                {promotionFeedback}
              </div>
            )}

            <div className="grid gap-4">
              {promotionsLoading ? (
                <div className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-sm text-center text-gray-400">
                  Cargando promociones...
                </div>
              ) : promotions.length === 0 ? (
                <div className="rounded-[2.5rem] p-8 bg-white border border-gray-100 shadow-sm text-center text-gray-400">
                  No hay promociones cargadas aún.
                </div>
              ) : (
                promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-gray-800">
                            {promotion.title}
                          </h4>
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600">
                            {promotion.badgeText ||
                              getPromotionDiscountLabel(promotion)}
                          </span>
                          {promotion.featured && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                              Destacada
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          {promotion.description}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${isPromotionLive(promotion) ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {isPromotionLive(promotion)
                            ? "Vigente"
                            : "No vigente"}
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                          Prioridad {promotion.priority || 0}
                        </p>
                      </div>
                    </div>

                    {promotion.image && (
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="w-full h-44 object-cover rounded-3xl border border-gray-100"
                      />
                    )}

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl bg-gray-50 p-4 border border-gray-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
                          Descuento
                        </p>
                        <p className="font-black text-rose-600">
                          {getPromotionDiscountLabel(promotion)}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-gray-50 p-4 border border-gray-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
                          Vigencia
                        </p>
                        <p className="font-bold text-gray-700 text-sm">
                          {promotion.startDate || "Sin inicio"} -{" "}
                          {promotion.endDate || "Sin fin"}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-gray-50 p-4 border border-gray-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
                          Aplica a
                        </p>
                        <p className="font-bold text-gray-700 text-sm">
                          {promotion.appliesToAllServices
                            ? "Todo el catálogo"
                            : `${promotion.serviceIds.length} servicio(s)`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Estado manual:{" "}
                        {promotion.isActive ? "Activo" : "Pausado"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPromotion(promotion)}
                          className="px-4 py-2 rounded-2xl bg-gray-900 text-white text-xs font-bold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePromotion(promotion.id)}
                          className="px-4 py-2 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handlePromotionSubmit}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {editingPromotion ? "Editar promoción" : "Nueva promoción"}
                  </h4>
                  <p className="text-gray-400 text-[11px]">
                    Configura campañas destacadas, vigencia y servicios
                    incluidos.
                  </p>
                </div>
                {editingPromotion && (
                  <button
                    type="button"
                    onClick={resetPromotionForm}
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Título
                  <input
                    value={promotionForm.title}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="Ej: Semana de primera consulta"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Badge / Etiqueta
                  <input
                    value={promotionForm.badgeText}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        badgeText: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="Ej: 20% OFF"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Tipo de descuento
                  <select
                    value={promotionForm.discountType}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        discountType: e.target.value as PromotionDiscountType,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Monto fijo</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Valor del descuento
                  <input
                    type="number"
                    value={promotionForm.discountValue}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        discountValue: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="15"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Prioridad
                  <input
                    type="number"
                    value={promotionForm.priority}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        priority: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="100"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Inicio de vigencia
                  <input
                    type="date"
                    value={promotionForm.startDate}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Fin de vigencia
                  <input
                    type="date"
                    value={promotionForm.endDate}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-gray-600">
                  URL de imagen
                  <input
                    value={promotionForm.imageUrl}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900"
                    placeholder="https://..."
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-600">
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedPromotionFile(e.target.files?.[0] || null)
                    }
                    className="w-full text-sm text-gray-600"
                  />
                  <p className="text-[11px] text-gray-400">
                    Si subes una imagen, esta reemplazará la URL anterior.
                  </p>
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-gray-600">
                Descripción
                <textarea
                  value={promotionForm.description}
                  onChange={(e) =>
                    setPromotionForm({
                      ...promotionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-3xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-gray-900 min-h-[120px] resize-none"
                  placeholder="Mensaje comercial o detalle de la campaña"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={promotionForm.isActive}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Publicada
                </label>
                <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={promotionForm.featured}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        featured: e.target.checked,
                      })
                    }
                  />
                  Destacada en Home
                </label>
                <label className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={promotionForm.appliesToAllServices}
                    onChange={(e) =>
                      setPromotionForm({
                        ...promotionForm,
                        appliesToAllServices: e.target.checked,
                        serviceIds: e.target.checked
                          ? []
                          : promotionForm.serviceIds,
                      })
                    }
                  />
                  Aplica a todos los servicios
                </label>
              </div>

              {!promotionForm.appliesToAllServices && (
                <div className="space-y-3 rounded-[2rem] border border-gray-100 bg-gray-50 p-5">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">
                      Servicios incluidos
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      Selecciona los servicios afectados por esta promoción.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={promotionForm.serviceIds.includes(
                            service.id,
                          )}
                          onChange={() => togglePromotionService(service.id)}
                        />
                        <span>{service.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPromotionSaving}
                className={`w-full py-4 rounded-3xl text-white font-bold transition ${isPromotionSaving ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"}`}
              >
                {isPromotionSaving
                  ? "Guardando promoción..."
                  : editingPromotion
                    ? "Actualizar promoción"
                    : "Crear promoción"}
              </button>
            </form>
          </div>
        )}
      </section>

      <footer className="mt-12 text-center opacity-20">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
          Gestión Interna Soledad Cedres Quiropráctica
        </p>
      </footer>
    </div>
  );
};

export default Admin;
