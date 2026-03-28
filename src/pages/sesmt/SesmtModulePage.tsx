import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Star,
  UploadCloud,
  X,
} from "lucide-react";
import SectionCard from "@/components/forms/SectionCard";
import FormField from "@/components/forms/FormField";
import AttachmentUploader from "@/components/upload/AttachmentUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Sheet removed — form is now inline below the table
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { getSesmtFilterPresets, getSesmtFormSchema } from "@/lib/sesmtFormSchemas";
import { getSesmtNodeByModuleKey } from "@/lib/sesmtMenu";
import {
  addSesmtEvidence,
  createSesmtRecord,
  getSesmtFavoritePreset,
  getSesmtLookups,
  getSesmtRecord,
  listSesmtRecords,
  saveSesmtFavoritePreset,
  updateSesmtRecord,
  uploadSesmtAttachments,
} from "@/services/sesmt";
import type { SesmtRecord } from "@/types/sesmt";

const CRITICALITY_OPTIONS = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
const STATUS_OPTIONS = ["ABERTO", "EM_ANDAMENTO", "CONCLUIDO", "ATRASADO"] as const;
const UNIT_OPTIONS = ["MAO", "BEL", "AGR"] as const;
const SORT_DIR_OPTIONS = [
  { value: "asc", label: "Crescente" },
  { value: "desc", label: "Decrescente" },
] as const;
const PAGE_SIZE = 20;

const emptyForm = {
  titulo: "",
  descricao: "",
  unidade: "MAO",
  status: "ABERTO",
  responsavel: "",
  criticidade: "MEDIA",
  nr: "",
  setor: "",
  funcao: "",
  vencimentoAt: "",
  investimento: "",
  custo: "",
  riscoInerente: "",
  riscoResidual: "",
};

type SesmtSpecificFormValues = Record<string, string>;
type SesmtFilterPreset = ReturnType<typeof getSesmtFilterPresets>[number];
type QuickFilterKey = "TODOS" | "VENCIDOS" | "VENCE_HOJE" | "CRITICOS" | "SEM_RESPONSAVEL" | "SEM_EVIDENCIA" | "MEUS_REGISTROS";
type VencimentoFilterKey = "ALL" | "VENCIDOS" | "HOJE" | "PROXIMOS";
type SesmtComment = {
  id: string;
  texto: string;
  usuario: string;
  data: string;
  parentId?: string;
};

function ensureRecordCollections(record: SesmtRecord): SesmtRecord {
  return {
    ...record,
    tags: Array.isArray(record.tags) ? record.tags : [],
    anexos: Array.isArray(record.anexos) ? record.anexos : [],
    evidencias: Array.isArray(record.evidencias) ? record.evidencias : [],
    historico: Array.isArray(record.historico) ? record.historico : [],
    origemVinculada: Array.isArray(record.origemVinculada) ? record.origemVinculada : [],
  };
}

function buildEmptySpecificForm(moduleKey: string): SesmtSpecificFormValues {
  const schema = getSesmtFormSchema(moduleKey);
  return schema.reduce<SesmtSpecificFormValues>((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}

function parseSpecificForm(
  moduleKey: string,
  values: SesmtSpecificFormValues,
): { payload: NonNullable<SesmtRecord["dadosEspecificos"]>; invalidNumberFields: string[] } {
  const schema = getSesmtFormSchema(moduleKey);
  const payload: NonNullable<SesmtRecord["dadosEspecificos"]> = {};
  const invalidNumberFields: string[] = [];

  schema.forEach((field) => {
    const rawValue = values[field.key] ?? "";
    const trimmed = rawValue.trim();
    if (!trimmed) {
      payload[field.key] = null;
      return;
    }

    if (field.type === "number") {
      const normalized = Number(trimmed.replace(",", "."));
      if (!Number.isFinite(normalized)) {
        invalidNumberFields.push(field.label);
        return;
      }
      payload[field.key] = normalized;
      return;
    }

    payload[field.key] = trimmed;
  });

  return { payload, invalidNumberFields };
}

function buildActiveSpecificFilters(values: SesmtSpecificFormValues): Record<string, string> | undefined {
  const entries = Object.entries(values)
    .map(([key, value]) => [key, value.trim()] as const)
    .filter(([, value]) => value.length > 0);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

const QUERY_KEYS = {
  module: "m",
  search: "q",
  page: "p",
  status: "status",
  criticidade: "crit",
  unidade: "unit",
  tipo: "type",
  setor: "sector",
  responsavel: "resp",
  nr: "nr",
  periodStart: "ps",
  periodEnd: "pe",
  vencimento: "due",
  quickFilter: "quick",
  sortBy: "sortBy",
  sortDir: "sortDir",
  preset: "preset",
  specificFilters: "sf",
  selectedRecord: "record",
} as const;

function parsePositiveInt(value: string | null, fallback = 1): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.trunc(parsed));
}

function safeJsonParseRecord(value: string | null): Record<string, string> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    const entries = Object.entries(parsed as Record<string, unknown>)
      .map(([key, raw]) => [key, String(raw ?? "").trim()] as const)
      .filter(([, normalized]) => normalized.length > 0);
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  } catch {
    return undefined;
  }
}

const SesmtModulePage = () => {
  const { moduleKey = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<SesmtRecord[]>([]);
  const [selected, setSelected] = useState<SesmtRecord | null>(null);
  const [lookups, setLookups] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [criticidadeFilter, setCriticidadeFilter] = useState("ALL");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [tipoFilter, setTipoFilter] = useState("ALL");
  const [setorFilter, setSetorFilter] = useState("");
  const [responsavelFilter, setResponsavelFilter] = useState("");
  const [nrFilter, setNrFilter] = useState("");
  const [periodStartFilter, setPeriodStartFilter] = useState("");
  const [periodEndFilter, setPeriodEndFilter] = useState("");
  const [vencimentoFilter, setVencimentoFilter] = useState<VencimentoFilterKey>("ALL");
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey>("TODOS");
  const [specificFilters, setSpecificFilters] = useState<SesmtSpecificFormValues>(buildEmptySpecificForm(moduleKey));
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activePresetKey, setActivePresetKey] = useState<string | null>(null);
  const [favoritePresetKey, setFavoritePresetKey] = useState<string | null>(null);
  const [favoriteHydrated, setFavoriteHydrated] = useState(false);
  const [pendingSelectedRecordId, setPendingSelectedRecordId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [specificForm, setSpecificForm] = useState<SesmtSpecificFormValues>(buildEmptySpecificForm(moduleKey));
  const [evidenceText, setEvidenceText] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [detailTab, setDetailTab] = useState("historico");
  const [commentDraft, setCommentDraft] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [commentsByRecord, setCommentsByRecord] = useState<Record<string, SesmtComment[]>>({});
  const { toast } = useToast();
  const queryHydratedModuleRef = useRef<string | null>(null);
  const skipNextPageResetRef = useRef(false);

  const moduleNode = useMemo(() => getSesmtNodeByModuleKey(moduleKey), [moduleKey]);
  const moduleSchema = useMemo(() => getSesmtFormSchema(moduleKey), [moduleKey]);
  const filterPresets = useMemo(() => getSesmtFilterPresets(moduleKey), [moduleKey]);
  const sortOptions = useMemo(() => {
    const base = [
      { value: "updatedAt", label: "Ultima atualizacao" },
      { value: "vencimentoAt", label: "Vencimento" },
      { value: "titulo", label: "Titulo" },
      { value: "status", label: "Status" },
      { value: "criticidade", label: "Criticidade" },
      { value: "responsavel", label: "Responsavel" },
    ];
    const specific = moduleSchema.map((field) => ({
      value: `specific:${field.key}`,
      label: `Campo dedicado: ${field.label}`,
    }));
    return [...base, ...specific];
  }, [moduleSchema]);
  const hasActiveSpecificFilters = useMemo(
    () => Object.values(specificFilters).some((value) => value.trim().length > 0),
    [specificFilters],
  );
  const selectedEvidencias = Array.isArray(selected?.evidencias) ? selected.evidencias : [];
  const selectedHistorico = Array.isArray(selected?.historico) ? selected.historico : [];
  const lookupSummary = lookups && typeof lookups === "object" ? lookups as Record<string, unknown> : null;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRecords / PAGE_SIZE)),
    [totalRecords],
  );
  const currentUserName = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = window.localStorage.getItem("sgq.authSession");
      if (!raw) return "";
      const parsed = JSON.parse(raw) as { nome?: string; email?: string };
      return (parsed?.nome || parsed?.email || "").trim();
    } catch {
      return "";
    }
  }, []);
  const tipoField = useMemo(
    () => moduleSchema.find((field) => /tipo/i.test(field.label) || /tipo/i.test(field.key)),
    [moduleSchema],
  );
  const getRecordTypeLabel = (record: SesmtRecord) => {
    if (tipoField) {
      const value = record.dadosEspecificos?.[tipoField.key];
      if (value != null && String(value).trim().length > 0) {
        return String(value);
      }
    }
    return moduleNode?.label || "Registro";
  };
  const tipoOptions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((record) => set.add(getRecordTypeLabel(record)));
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [records, tipoField, moduleNode?.label]);
  const filteredRecords = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const nextSevenDays = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
    const normalizedCurrentUser = currentUserName.toLowerCase();

    const matchesQuickFilter = (record: SesmtRecord) => {
      switch (quickFilter) {
        case "VENCIDOS":
          return Boolean(record.vencimentoAt && record.vencimentoAt < today && record.status !== "CONCLUIDO");
        case "VENCE_HOJE":
          return Boolean(record.vencimentoAt && record.vencimentoAt === today && record.status !== "CONCLUIDO");
        case "CRITICOS":
          return record.criticidade === "CRITICA";
        case "SEM_RESPONSAVEL":
          return !record.responsavel?.trim();
        case "SEM_EVIDENCIA":
          return !Array.isArray(record.evidencias) || record.evidencias.length === 0;
        case "MEUS_REGISTROS":
          if (!normalizedCurrentUser) return false;
          return record.responsavel.toLowerCase().includes(normalizedCurrentUser)
            || record.createdBy.toLowerCase().includes(normalizedCurrentUser)
            || record.updatedBy.toLowerCase().includes(normalizedCurrentUser);
        case "TODOS":
        default:
          return true;
      }
    };

    return records.filter((record) => {
      if (tipoFilter !== "ALL" && getRecordTypeLabel(record) !== tipoFilter) return false;
      if (setorFilter.trim() && !(record.setor || "").toLowerCase().includes(setorFilter.trim().toLowerCase())) return false;
      if (responsavelFilter.trim() && !(record.responsavel || "").toLowerCase().includes(responsavelFilter.trim().toLowerCase())) return false;
      if (nrFilter.trim() && !(record.nr || "").toLowerCase().includes(nrFilter.trim().toLowerCase())) return false;
      if (periodStartFilter && record.createdAt.slice(0, 10) < periodStartFilter) return false;
      if (periodEndFilter && record.createdAt.slice(0, 10) > periodEndFilter) return false;

      if (vencimentoFilter === "VENCIDOS" && !(record.vencimentoAt && record.vencimentoAt < today && record.status !== "CONCLUIDO")) return false;
      if (vencimentoFilter === "HOJE" && !(record.vencimentoAt && record.vencimentoAt === today && record.status !== "CONCLUIDO")) return false;
      if (vencimentoFilter === "PROXIMOS" && !(record.vencimentoAt && record.vencimentoAt >= today && record.vencimentoAt <= nextSevenDays && record.status !== "CONCLUIDO")) return false;

      return matchesQuickFilter(record);
    });
  }, [
    records,
    tipoFilter,
    setorFilter,
    responsavelFilter,
    nrFilter,
    periodStartFilter,
    periodEndFilter,
    vencimentoFilter,
    quickFilter,
    currentUserName,
    tipoField,
    moduleNode?.label,
  ]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const kpiCards = useMemo(() => {
    const abertos = filteredRecords.filter((record) => record.status === "ABERTO" || record.status === "EM_ANDAMENTO").length;
    const vencidos = filteredRecords.filter((record) => Boolean(record.vencimentoAt && record.vencimentoAt < today && record.status !== "CONCLUIDO")).length;
    const criticos = filteredRecords.filter((record) => record.criticidade === "CRITICA").length;
    const semResponsavel = filteredRecords.filter((record) => !record.responsavel?.trim()).length;
    const concluidosPeriodo = filteredRecords.filter((record) => {
      if (record.status !== "CONCLUIDO") return false;
      const updatedDate = record.updatedAt.slice(0, 10);
      if (periodStartFilter && updatedDate < periodStartFilter) return false;
      if (periodEndFilter && updatedDate > periodEndFilter) return false;
      return true;
    }).length;

    return [
      { label: "Total registros", value: totalRecords },
      { label: "Abertos", value: abertos },
      { label: "Vencidos", value: vencidos, tone: "text-red-600" },
      { label: "Criticos", value: criticos, tone: "text-red-600" },
      { label: "Sem responsavel", value: semResponsavel, tone: "text-amber-600" },
      { label: "Concluidos no periodo", value: concluidosPeriodo, tone: "text-emerald-600" },
    ];
  }, [filteredRecords, totalRecords, periodStartFilter, periodEndFilter, today]);
  const nrAplicaveis = useMemo(() => {
    const set = new Set(
      records
        .map((record) => (record.nr || "").trim())
        .filter(Boolean),
    );
    return set.size;
  }, [records]);
  const selectedComments = useMemo(() => {
    if (!selected) return [];
    return commentsByRecord[selected.id] || [];
  }, [commentsByRecord, selected]);

  const load = async () => {
    if (!moduleKey || !favoriteHydrated || !moduleNode) return;
    setLoading(true);
    setAccessDenied(false);
    try {
      const [listResult, lookupResult] = await Promise.all([
        listSesmtRecords(moduleKey, {
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          criticidade: criticidadeFilter === "ALL" ? undefined : criticidadeFilter,
          unidade: unitFilter === "ALL" ? undefined : unitFilter,
          responsavel: responsavelFilter || undefined,
          nr: nrFilter || undefined,
          periodStart: periodStartFilter || undefined,
          periodEnd: periodEndFilter || undefined,
          specificFilters: buildActiveSpecificFilters(specificFilters),
          sortBy,
          sortDir,
        }),
        getSesmtLookups(),
      ]);
      const safeItems = Array.isArray(listResult?.items)
        ? listResult.items.map((item) => ensureRecordCollections(item))
        : [];
      setTotalRecords(Number(listResult?.total || 0));
      setRecords(safeItems);
      setLookups(lookupResult && typeof lookupResult === "object" ? lookupResult : null);

      if (selected) {
        const refreshed = safeItems.find((item) => item.id === selected.id);
        if (refreshed) {
          setSelected(refreshed);
        } else {
          setSelected(null);
          setForm(emptyForm);
          setSpecificForm(buildEmptySpecificForm(moduleKey));
        }
      }
    } catch (error) {
      const status = typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status)
        : 0;
      if (status === 403) {
        setAccessDenied(true);
        setRecords([]);
        setLookups(null);
        setSelected(null);
        setTotalRecords(0);
      }
      const message = error instanceof Error ? error.message : "Falha ao carregar registros SESMT.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [
    moduleKey,
    moduleNode,
    favoriteHydrated,
    page,
    search,
    statusFilter,
    criticidadeFilter,
    unitFilter,
    responsavelFilter,
    nrFilter,
    periodStartFilter,
    periodEndFilter,
    specificFilters,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
      return;
    }
    setPage(1);
  }, [
    moduleKey,
    search,
    statusFilter,
    criticidadeFilter,
    unitFilter,
    responsavelFilter,
    nrFilter,
    periodStartFilter,
    periodEndFilter,
    tipoFilter,
    setorFilter,
    vencimentoFilter,
    quickFilter,
    specificFilters,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    setRecords([]);
    setSelected(null);
    setPendingSelectedRecordId(null);
    setLookups(null);
    setAccessDenied(false);
    setPage(1);
    setTotalRecords(0);
    setSearch("");
    setStatusFilter("ALL");
    setSpecificFilters(buildEmptySpecificForm(moduleKey));
    setSpecificForm(buildEmptySpecificForm(moduleKey));
    setUnitFilter("ALL");
    setTipoFilter("ALL");
    setSetorFilter("");
    setResponsavelFilter("");
    setNrFilter("");
    setPeriodStartFilter("");
    setPeriodEndFilter("");
    setVencimentoFilter("ALL");
    setQuickFilter("TODOS");
    setDetailTab("historico");
    setCommentDraft("");
    setReplyToCommentId(null);
    setSortBy("updatedAt");
    setSortDir("desc");
    setActivePresetKey(null);
    setFavoritePresetKey(null);
    setFavoriteHydrated(false);
    setCriticidadeFilter("ALL");
    queryHydratedModuleRef.current = null;
  }, [moduleKey]);

  useEffect(() => {
    if (!moduleKey || queryHydratedModuleRef.current === moduleKey) return;

    const scopedModule = searchParams.get(QUERY_KEYS.module);
    const hasScopedQuery = scopedModule === moduleKey;
    if (!hasScopedQuery) {
      queryHydratedModuleRef.current = moduleKey;
      return;
    }

    const parsedSpecificFilters = safeJsonParseRecord(searchParams.get(QUERY_KEYS.specificFilters));
    const nextSpecificFilters = {
      ...buildEmptySpecificForm(moduleKey),
      ...(parsedSpecificFilters || {}),
    };

    skipNextPageResetRef.current = true;
    setSearch(searchParams.get(QUERY_KEYS.search) || "");
    setStatusFilter(searchParams.get(QUERY_KEYS.status) || "ALL");
    setCriticidadeFilter(searchParams.get(QUERY_KEYS.criticidade) || "ALL");
    setUnitFilter(searchParams.get(QUERY_KEYS.unidade) || "ALL");
    setTipoFilter(searchParams.get(QUERY_KEYS.tipo) || "ALL");
    setSetorFilter(searchParams.get(QUERY_KEYS.setor) || "");
    setResponsavelFilter(searchParams.get(QUERY_KEYS.responsavel) || "");
    setNrFilter(searchParams.get(QUERY_KEYS.nr) || "");
    setPeriodStartFilter(searchParams.get(QUERY_KEYS.periodStart) || "");
    setPeriodEndFilter(searchParams.get(QUERY_KEYS.periodEnd) || "");
    const dueParam = searchParams.get(QUERY_KEYS.vencimento);
    setVencimentoFilter(
      dueParam === "VENCIDOS" || dueParam === "HOJE" || dueParam === "PROXIMOS" ? dueParam : "ALL",
    );
    const quickParam = searchParams.get(QUERY_KEYS.quickFilter);
    setQuickFilter(
      quickParam === "VENCIDOS"
      || quickParam === "VENCE_HOJE"
      || quickParam === "CRITICOS"
      || quickParam === "SEM_RESPONSAVEL"
      || quickParam === "SEM_EVIDENCIA"
      || quickParam === "MEUS_REGISTROS"
        ? quickParam
        : "TODOS",
    );
    setSortBy(searchParams.get(QUERY_KEYS.sortBy) || "updatedAt");
    setSortDir(searchParams.get(QUERY_KEYS.sortDir) === "asc" ? "asc" : "desc");
    setPage(parsePositiveInt(searchParams.get(QUERY_KEYS.page), 1));
    setActivePresetKey(searchParams.get(QUERY_KEYS.preset));
    setSpecificFilters(nextSpecificFilters);
    setPendingSelectedRecordId(searchParams.get(QUERY_KEYS.selectedRecord));
    setFavoriteHydrated(true);

    queryHydratedModuleRef.current = moduleKey;
  }, [moduleKey, searchParams]);

  useEffect(() => {
    let active = true;
    if (!moduleKey) return undefined;
    if (!moduleNode) {
      setFavoriteHydrated(true);
      return undefined;
    }

    if (searchParams.get(QUERY_KEYS.module) === moduleKey) {
      setFavoriteHydrated(true);
      return undefined;
    }

    const hydrateFavoritePreset = async () => {
      try {
        const response = await getSesmtFavoritePreset(moduleKey);
        if (!active) return;

        const favorite = response.favoritePreset;
        if (!favorite) {
          setFavoritePresetKey(null);
          setFavoriteHydrated(true);
          return;
        }

        const normalizedSpecificFilters = {
          ...buildEmptySpecificForm(moduleKey),
          ...(favorite.specificFilters || {}),
        };

        setFavoritePresetKey(favorite.presetKey);
        setActivePresetKey(
          favorite.presetKey && filterPresets.some((preset) => preset.key === favorite.presetKey)
            ? favorite.presetKey
            : null,
        );
        setStatusFilter(favorite.status || "ALL");
        setCriticidadeFilter(favorite.criticidade || "ALL");
        setUnitFilter(favorite.unidade || "ALL");
        setSpecificFilters(normalizedSpecificFilters);
        setSortBy(favorite.sortBy || "updatedAt");
        setSortDir(favorite.sortDir || "desc");
      } catch {
        if (active) {
          setFavoritePresetKey(null);
        }
      } finally {
        if (active) {
          setFavoriteHydrated(true);
        }
      }
    };

    void hydrateFavoritePreset();
    return () => {
      active = false;
    };
  }, [moduleKey, moduleNode, filterPresets, searchParams]);

  useEffect(() => {
    if (!moduleKey || !favoriteHydrated) return;

    const nextParams = new URLSearchParams();
    nextParams.set(QUERY_KEYS.module, moduleKey);
    if (search.trim()) nextParams.set(QUERY_KEYS.search, search.trim());
    if (page > 1) nextParams.set(QUERY_KEYS.page, String(page));
    if (statusFilter !== "ALL") nextParams.set(QUERY_KEYS.status, statusFilter);
    if (criticidadeFilter !== "ALL") nextParams.set(QUERY_KEYS.criticidade, criticidadeFilter);
    if (unitFilter !== "ALL") nextParams.set(QUERY_KEYS.unidade, unitFilter);
    if (tipoFilter !== "ALL") nextParams.set(QUERY_KEYS.tipo, tipoFilter);
    if (setorFilter.trim()) nextParams.set(QUERY_KEYS.setor, setorFilter.trim());
    if (responsavelFilter.trim()) nextParams.set(QUERY_KEYS.responsavel, responsavelFilter.trim());
    if (nrFilter.trim()) nextParams.set(QUERY_KEYS.nr, nrFilter.trim());
    if (periodStartFilter) nextParams.set(QUERY_KEYS.periodStart, periodStartFilter);
    if (periodEndFilter) nextParams.set(QUERY_KEYS.periodEnd, periodEndFilter);
    if (vencimentoFilter !== "ALL") nextParams.set(QUERY_KEYS.vencimento, vencimentoFilter);
    if (quickFilter !== "TODOS") nextParams.set(QUERY_KEYS.quickFilter, quickFilter);
    if (sortBy !== "updatedAt") nextParams.set(QUERY_KEYS.sortBy, sortBy);
    if (sortDir !== "desc") nextParams.set(QUERY_KEYS.sortDir, sortDir);
    if (activePresetKey) nextParams.set(QUERY_KEYS.preset, activePresetKey);

    const activeSpecificFilters = buildActiveSpecificFilters(specificFilters);
    if (activeSpecificFilters && Object.keys(activeSpecificFilters).length > 0) {
      nextParams.set(QUERY_KEYS.specificFilters, JSON.stringify(activeSpecificFilters));
    }

    if (selected?.id) {
      nextParams.set(QUERY_KEYS.selectedRecord, selected.id);
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    moduleKey,
    favoriteHydrated,
    search,
    page,
    statusFilter,
    criticidadeFilter,
    unitFilter,
    tipoFilter,
    setorFilter,
    responsavelFilter,
    nrFilter,
    periodStartFilter,
    periodEndFilter,
    vencimentoFilter,
    quickFilter,
    sortBy,
    sortDir,
    specificFilters,
    activePresetKey,
    selected?.id,
    searchParams,
    setSearchParams,
  ]);

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setSpecificFilterField = (field: string, value: string) => {
    setActivePresetKey(null);
    setSpecificFilters((prev) => ({ ...prev, [field]: value }));
  };

  const persistFavoritePreset = async (
    payload: {
      presetKey: string | null;
      status: string;
      criticidade: string;
      unidade: string;
      sortBy: string;
      sortDir: "asc" | "desc";
      specificFilters: SesmtSpecificFormValues;
    },
    silent = false,
  ) => {
    if (!moduleKey) return;
    try {
      const result = await saveSesmtFavoritePreset(moduleKey, {
        presetKey: payload.presetKey,
        status: payload.status === "ALL" ? undefined : payload.status,
        criticidade: payload.criticidade === "ALL" ? undefined : payload.criticidade,
        unidade: payload.unidade === "ALL" ? undefined : payload.unidade,
        sortBy: payload.sortBy,
        sortDir: payload.sortDir,
        specificFilters: buildActiveSpecificFilters(payload.specificFilters),
      });
      setFavoritePresetKey(result.favoritePreset.presetKey);
      if (!silent) {
        toast({ title: "Favorito salvo", description: "Preset favorito atualizado para este submodulo." });
      }
    } catch (error) {
      if (!silent) {
        const message = error instanceof Error ? error.message : "Falha ao salvar preset favorito.";
        toast({ title: "Erro", description: message, variant: "destructive" });
      }
    }
  };

  const applyFilterPreset = (preset: SesmtFilterPreset) => {
    const nextStatus = preset.status ?? "ALL";
    const nextCriticidade = preset.criticidade ?? "ALL";
    const nextSpecificFilters = {
      ...buildEmptySpecificForm(moduleKey),
      ...(preset.specificFilters ?? {}),
    };
    const nextSortBy = preset.sortBy || "updatedAt";
    const nextSortDir = preset.sortDir || "desc";

    setActivePresetKey(preset.key);
    setStatusFilter(nextStatus);
    setCriticidadeFilter(nextCriticidade);
    setSpecificFilters(nextSpecificFilters);
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);

    void persistFavoritePreset({
      presetKey: preset.key,
      status: nextStatus,
      criticidade: nextCriticidade,
      unidade: unitFilter,
      sortBy: nextSortBy,
      sortDir: nextSortDir,
      specificFilters: nextSpecificFilters,
    }, true);
  };

  const setSpecificField = (field: string, value: string) => {
    setSpecificForm((prev) => ({ ...prev, [field]: value }));
  };

  const openRecord = async (id: string) => {
    try {
      const record = await getSesmtRecord(moduleKey, id);
      const normalizedRecord = ensureRecordCollections(record);
      setSelected(normalizedRecord);
      setForm({
        titulo: normalizedRecord.titulo,
        descricao: normalizedRecord.descricao,
        unidade: normalizedRecord.unidade,
        status: normalizedRecord.status,
        responsavel: normalizedRecord.responsavel,
        criticidade: normalizedRecord.criticidade,
        nr: normalizedRecord.nr || "",
        setor: normalizedRecord.setor || "",
        funcao: normalizedRecord.funcao || "",
        vencimentoAt: normalizedRecord.vencimentoAt || "",
        investimento: normalizedRecord.investimento ? String(normalizedRecord.investimento) : "",
        custo: normalizedRecord.custo ? String(normalizedRecord.custo) : "",
        riscoInerente: normalizedRecord.riscoInerente ? String(normalizedRecord.riscoInerente) : "",
        riscoResidual: normalizedRecord.riscoResidual ? String(normalizedRecord.riscoResidual) : "",
      });
      const schema = getSesmtFormSchema(moduleKey);
      const specific: SesmtSpecificFormValues = {};
      schema.forEach((field) => {
        const value = normalizedRecord.dadosEspecificos?.[field.key];
        specific[field.key] = value == null ? "" : String(value);
      });
      setSpecificForm(specific);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel abrir o registro.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!pendingSelectedRecordId || !favoriteHydrated || !moduleKey || loading) return;
    if (selected?.id === pendingSelectedRecordId) {
      setPendingSelectedRecordId(null);
      return;
    }

    const existsInPage = records.some((record) => record.id === pendingSelectedRecordId);
    if (!existsInPage) {
      if (!loading && records.length > 0) {
        setPendingSelectedRecordId(null);
      }
      return;
    }

    void openRecord(pendingSelectedRecordId);
    setPendingSelectedRecordId(null);
  }, [pendingSelectedRecordId, favoriteHydrated, moduleKey, loading, records, selected?.id]);

  const buildPayload = () => {
    const { payload: dadosEspecificos } = parseSpecificForm(moduleKey, specificForm);
    return {
      ...form,
      criticidade: form.criticidade as SesmtRecord["criticidade"],
      investimento: form.investimento ? Number(form.investimento) : undefined,
      custo: form.custo ? Number(form.custo) : undefined,
      riscoInerente: form.riscoInerente ? Number(form.riscoInerente) : undefined,
      riscoResidual: form.riscoResidual ? Number(form.riscoResidual) : undefined,
      dadosEspecificos,
      tags: [moduleKey, form.unidade, form.criticidade],
    };
  };

  const validateSpecificForm = () => {
    const missingRequired = moduleSchema
      .filter((field) => field.required && !(specificForm[field.key] || "").trim())
      .map((field) => field.label);
    if (missingRequired.length > 0) {
      return `Preencha os campos obrigatorios: ${missingRequired.join(", ")}.`;
    }

    const { invalidNumberFields } = parseSpecificForm(moduleKey, specificForm);
    if (invalidNumberFields.length > 0) {
      return `Valores numericos invalidos em: ${invalidNumberFields.join(", ")}.`;
    }

    return null;
  };

  const handleCreate = async () => {
    if (!form.titulo.trim() || !form.responsavel.trim()) {
      toast({ title: "Campos obrigatorios", description: "Informe ao menos titulo e responsavel.", variant: "destructive" });
      return;
    }

    const specificValidation = validateSpecificForm();
    if (specificValidation) {
      toast({ title: "Campos especificos", description: specificValidation, variant: "destructive" });
      return;
    }

    try {
      const created = await createSesmtRecord(moduleKey, buildPayload());
      toast({ title: "Registro criado", description: `${created.id} cadastrado com sucesso.` });
      setForm(emptyForm);
      setSpecificForm(buildEmptySpecificForm(moduleKey));
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar registro.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    const specificValidation = validateSpecificForm();
    if (specificValidation) {
      toast({ title: "Campos especificos", description: specificValidation, variant: "destructive" });
      return;
    }

    try {
      const updated = await updateSesmtRecord(moduleKey, selected.id, buildPayload());
      setSelected(ensureRecordCollections(updated));
      toast({ title: "Registro atualizado", description: `${updated.id} atualizado.` });
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar registro.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  const handleEvidence = async () => {
    if (!selected || !evidenceText.trim()) return;
    try {
      const updated = await addSesmtEvidence(moduleKey, selected.id, { descricao: evidenceText });
      setSelected(ensureRecordCollections(updated));
      setEvidenceText("");
      toast({ title: "Evidencia registrada", description: "Evidencia adicionada ao historico." });
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao registrar evidencia.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!selected || uploadFiles.length === 0) return;
    try {
      const result = await uploadSesmtAttachments(moduleKey, selected.id, uploadFiles);
      toast({ title: "Upload concluido", description: `${result.uploaded.length} arquivo(s) enviado(s).` });
      setUploadFiles([]);
      await openRecord(selected.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload de anexos.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  const handleNewRecord = () => {
    setSelected(null);
    setForm(emptyForm);
    setSpecificForm(buildEmptySpecificForm(moduleKey));
    setEvidenceText("");
    setUploadFiles([]);
    setDetailTab("historico");
    setCommentDraft("");
    setReplyToCommentId(null);
  };

  const handleExport = () => {
    const rows = filteredRecords.map((record) => ({
      tipo: getRecordTypeLabel(record),
      codigo: record.id,
      titulo: record.titulo,
      unidade: record.unidade,
      status: record.status,
      criticidade: record.criticidade,
      vencimento: record.vencimentoAt || "",
      nr: record.nr || "",
      responsavel: record.responsavel || "",
      setor: record.setor || "",
    }));

    if (rows.length === 0) {
      toast({ title: "Sem dados", description: "Nao ha registros para exportar com os filtros atuais." });
      return;
    }

    const csvHeader = Object.keys(rows[0]);
    const csvBody = rows
      .map((row) => csvHeader.map((key) => `"${String(row[key as keyof typeof row] || "").replace(/"/g, "\"\"")}"`).join(","))
      .join("\n");
    const csv = `${csvHeader.join(",")}\n${csvBody}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sesmt-${moduleKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickFilter = (filter: QuickFilterKey) => {
    setQuickFilter(filter);
    if (filter === "CRITICOS") {
      setCriticidadeFilter("CRITICA");
    }
    if (filter === "VENCIDOS") {
      setVencimentoFilter("VENCIDOS");
    }
    if (filter === "VENCE_HOJE") {
      setVencimentoFilter("HOJE");
    }
  };

  const handleOpenRecordByTab = async (id: string, tab: string) => {
    await openRecord(id);
    setDetailTab(tab);
  };

  const handleDuplicateRecord = (record: SesmtRecord) => {
    const normalized = ensureRecordCollections(record);
    setSelected(null);
    setForm({
      titulo: `${normalized.titulo} (copia)`,
      descricao: normalized.descricao || "",
      unidade: normalized.unidade || "MAO",
      status: "ABERTO",
      responsavel: normalized.responsavel || "",
      criticidade: normalized.criticidade || "MEDIA",
      nr: normalized.nr || "",
      setor: normalized.setor || "",
      funcao: normalized.funcao || "",
      vencimentoAt: normalized.vencimentoAt || "",
      investimento: normalized.investimento ? String(normalized.investimento) : "",
      custo: normalized.custo ? String(normalized.custo) : "",
      riscoInerente: normalized.riscoInerente ? String(normalized.riscoInerente) : "",
      riscoResidual: normalized.riscoResidual ? String(normalized.riscoResidual) : "",
    });

    const schema = getSesmtFormSchema(moduleKey);
    const duplicatedSpecific: SesmtSpecificFormValues = {};
    schema.forEach((field) => {
      const value = normalized.dadosEspecificos?.[field.key];
      duplicatedSpecific[field.key] = value == null ? "" : String(value);
    });
    setSpecificForm(duplicatedSpecific);
    toast({ title: "Duplicado", description: "Registro carregado como copia para novo cadastro." });
  };

  const handleSetRecordStatus = async (record: SesmtRecord, status: SesmtRecord["status"]) => {
    try {
      const updated = await updateSesmtRecord(moduleKey, record.id, { status });
      if (selected?.id === record.id) {
        setSelected(ensureRecordCollections(updated));
      }
      toast({ title: "Status atualizado", description: `${record.id} alterado para ${status}.` });
      await load();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar status.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  };

  const handleAddComment = () => {
    if (!selected || !commentDraft.trim()) return;
    const nextComment: SesmtComment = {
      id: `COM-${Date.now()}`,
      texto: commentDraft.trim(),
      usuario: currentUserName || "Usuario",
      data: new Date().toISOString(),
      parentId: replyToCommentId || undefined,
    };

    setCommentsByRecord((prev) => ({
      ...prev,
      [selected.id]: [nextComment, ...(prev[selected.id] || [])],
    }));
    setCommentDraft("");
    setReplyToCommentId(null);
    toast({ title: "Comentario registrado", description: "Comentario incluido na trilha colaborativa." });
  };

  const getStatusTone = (status: string) => {
    if (status === "CONCLUIDO") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "EM_ANDAMENTO") return "bg-sky-100 text-sky-700 border-sky-200";
    if (status === "ATRASADO") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getCriticidadeTone = (criticidade: SesmtRecord["criticidade"]) => {
    if (criticidade === "CRITICA") return "bg-red-100 text-red-700 border-red-200";
    if (criticidade === "ALTA") return "bg-orange-100 text-orange-700 border-orange-200";
    if (criticidade === "MEDIA") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  const isOverdue = (record: SesmtRecord) => Boolean(record.vencimentoAt && record.vencimentoAt < today && record.status !== "CONCLUIDO");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"form" | "historico" | "evidencias" | "comentarios" | "acoes">("form");

  if (!moduleNode) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">SESMT / SST</h1>
        <SectionCard title="Submodulo nao encontrado" description="A rota informada nao corresponde a um submodulo valido.">
          <p className="text-sm text-muted-foreground">Revise o link acessado e tente novamente pelo menu lateral.</p>
        </SectionCard>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">{moduleNode.label}</h1>
        <SectionCard title="Acesso Negado" description="Seu perfil nao possui permissao para este submodulo SESMT/SST.">
          <p className="text-sm text-muted-foreground">Solicite liberacao ao administrador ou acesse outro submodulo permitido.</p>
        </SectionCard>
      </div>
    );
  }

  const openRecordInPanel = async (id: string, tab: "form" | "historico" | "evidencias" | "comentarios" | "acoes" = "form") => {
    await openRecord(id);
    setPanelTab(tab);
    setBottomPanelOpen(true);
  };

  const openNewRecordPanel = () => {
    handleNewRecord();
    setPanelTab("form");
    setBottomPanelOpen(true);
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header compacto */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{moduleNode?.label || "SESMT / SST"}</h1>
          <p className="text-xs text-muted-foreground">
            Planta: <span className="font-medium text-foreground">{unitFilter === "ALL" ? "Corporativo" : unitFilter}</span>
            {" • "}{totalRecords} registros
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button type="button" size="sm" className="gap-1.5" onClick={openNewRecordPanel}>
            <Plus className="w-3.5 h-3.5" /> Novo
          </Button>
          <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
          <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => void load()}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button" size="sm" variant="outline" className="gap-1.5"
            onClick={() => void persistFavoritePreset({ presetKey: activePresetKey, status: statusFilter, criticidade: criticidadeFilter, unidade: unitFilter, sortBy, sortDir, specificFilters })}
          >
            <Star className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPIs compactos */}
      <div className="grid gap-2 grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card px-2.5 py-1.5">
            <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
            <p className={`text-lg font-bold leading-tight ${card.tone || "text-foreground"}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros colapsáveis */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Filtros
            </Button>
          </CollapsibleTrigger>
          {/* Quick filters inline */}
          <div className="flex flex-wrap gap-1">
            {(["TODOS", "VENCIDOS", "CRITICOS", "SEM_RESPONSAVEL", "MEUS_REGISTROS"] as QuickFilterKey[]).map((qf) => (
              <Button key={qf} type="button" size="sm" variant={quickFilter === qf ? "default" : "ghost"} className="h-7 px-2 text-xs" onClick={() => handleQuickFilter(qf)}>
                {qf === "TODOS" ? "Todos" : qf === "VENCIDOS" ? "Vencidos" : qf === "CRITICOS" ? "Críticos" : qf === "SEM_RESPONSAVEL" ? "S/ Resp." : "Meus"}
              </Button>
            ))}
          </div>
          <Input placeholder="Buscar..." className="h-7 max-w-[220px] text-xs" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        <CollapsibleContent className="mt-2">
          <div className="rounded-lg border border-border bg-card p-3 space-y-3">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  {tipoOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={unitFilter} onValueChange={(value) => setUnitFilter(value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Unidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  {UNIT_OPTIONS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={criticidadeFilter} onValueChange={(value) => setCriticidadeFilter(value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Criticidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  {CRITICALITY_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={vencimentoFilter} onValueChange={(value) => setVencimentoFilter(value as VencimentoFilterKey)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Vencimento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="VENCIDOS">Vencidos</SelectItem>
                  <SelectItem value="HOJE">Hoje</SelectItem>
                  <SelectItem value="PROXIMOS">7 dias</SelectItem>
                </SelectContent>
              </Select>
              <Input className="h-8 text-xs" placeholder="Setor" value={setorFilter} onChange={(event) => setSetorFilter(event.target.value)} />
              <Input className="h-8 text-xs" placeholder="Responsável" value={responsavelFilter} onChange={(event) => setResponsavelFilter(event.target.value)} />
              <Input className="h-8 text-xs" placeholder="NR" value={nrFilter} onChange={(event) => setNrFilter(event.target.value)} />
              <Input className="h-8 text-xs" type="date" value={periodStartFilter} onChange={(event) => setPeriodStartFilter(event.target.value)} />
              <Input className="h-8 text-xs" type="date" value={periodEndFilter} onChange={(event) => setPeriodEndFilter(event.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger className="h-8 text-xs max-w-[200px]"><SelectValue placeholder="Ordenar" /></SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortDir} onValueChange={(value) => setSortDir(value as "asc" | "desc")}>
                <SelectTrigger className="h-8 text-xs max-w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_DIR_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => {
                setSearch(""); setStatusFilter("ALL"); setCriticidadeFilter("ALL"); setUnitFilter("ALL"); setTipoFilter("ALL");
                setSetorFilter(""); setResponsavelFilter(""); setNrFilter(""); setPeriodStartFilter(""); setPeriodEndFilter("");
                setVencimentoFilter("ALL"); setQuickFilter("TODOS"); setSortBy("updatedAt"); setSortDir("desc");
                setSpecificFilters(buildEmptySpecificForm(moduleKey));
              }}>Limpar filtros</Button>
            </div>

            {filterPresets.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                {filterPresets.map((preset) => (
                  <Button key={preset.key} type="button" size="sm" variant={activePresetKey === preset.key ? "default" : "outline"} className="h-7 text-xs" onClick={() => applyFilterPreset(preset)}>
                    {favoritePresetKey === preset.key ? `★ ${preset.label}` : preset.label}
                  </Button>
                ))}
              </div>
            )}

            {moduleSchema.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-1.5">Filtros do submódulo</p>
                <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                  {moduleSchema.map((field) => (
                    <div key={field.key}>
                      {field.type === "select" && (
                        <Select value={specificFilters[field.key] || "ALL"} onValueChange={(value) => setSpecificFilterField(field.key, value === "ALL" ? "" : value)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={field.label} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {(field.options || []).map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                      {field.type !== "select" && (
                        <Input className="h-8 text-xs" type={field.type === "date" ? "date" : "text"} placeholder={field.label} value={specificFilters[field.key] || ""} onChange={(event) => setSpecificFilterField(field.key, event.target.value)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Contexto compacto inline */}
      {lookupSummary && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Unidades: <strong className="text-foreground">{Array.isArray(lookupSummary?.unidades) ? lookupSummary.unidades.length : 0}</strong></span>
          <span>Setores: <strong className="text-foreground">{Array.isArray(lookupSummary?.setores) ? lookupSummary.setores.length : 0}</strong></span>
          <span>Colaboradores: <strong className="text-foreground">{Array.isArray(lookupSummary?.colaboradores) ? lookupSummary.colaboradores.length : 0}</strong></span>
          <span>NR aplicáveis: <strong className="text-foreground">{nrAplicaveis}</strong></span>
        </div>
      )}

      {/* Tabela full-width */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Código</TableHead>
                <TableHead className="text-xs">Título</TableHead>
                <TableHead className="text-xs">Unidade</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Criticidade</TableHead>
                <TableHead className="text-xs">Vencimento</TableHead>
                <TableHead className="text-xs">NR</TableHead>
                <TableHead className="text-xs">Responsável</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground text-xs py-8" colSpan={10}>Carregando registros...</TableCell>
                </TableRow>
              )}
              {!loading && filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground text-xs py-8" colSpan={10}>
                    Nenhum registro encontrado. Clique em <strong>Novo</strong> para criar o primeiro.
                  </TableCell>
                </TableRow>
              )}
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className={`cursor-pointer hover:bg-muted/40 ${selected?.id === record.id ? "bg-primary/5" : ""}`}
                  onClick={() => void openRecordInPanel(record.id)}
                >
                  <TableCell className="whitespace-nowrap text-xs py-2">{getRecordTypeLabel(record)}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-xs py-2">{record.id}</TableCell>
                  <TableCell className="text-xs py-2 max-w-[200px] truncate">{record.titulo}</TableCell>
                  <TableCell className="text-xs py-2">{record.unidade}</TableCell>
                  <TableCell className="py-2">
                    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getStatusTone(record.status)}`}>{record.status}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getCriticidadeTone(record.criticidade)}`}>{record.criticidade}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className={`text-xs ${isOverdue(record) ? "font-semibold text-destructive" : "text-foreground"}`}>{record.vencimentoAt || "-"}</span>
                  </TableCell>
                  <TableCell className="text-xs py-2">{record.nr || "-"}</TableCell>
                  <TableCell className="text-xs py-2">{record.responsavel || "-"}</TableCell>
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-0.5">
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Editar" onClick={() => void openRecordInPanel(record.id, "form")}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Histórico" onClick={() => void openRecordInPanel(record.id, "historico")}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Evidência" onClick={() => void openRecordInPanel(record.id, "evidencias")}>
                        <UploadCloud className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Duplicar" onClick={() => handleDuplicateRecord(record)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-emerald-700" title="Concluir" disabled={record.status === "CONCLUIDO"} onClick={() => void handleSetRecordStatus(record, "CONCLUIDO")}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <p>{filteredRecords.length} de {totalRecords} • Pág. {Math.min(page, totalPages)}/{totalPages}</p>
          <div className="flex items-center gap-1.5">
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" disabled={loading || page <= 1} onClick={() => setPage((c) => Math.max(1, c - 1))}>Anterior</Button>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" disabled={loading || page >= totalPages} onClick={() => setPage((c) => Math.min(totalPages, c + 1))}>Próxima</Button>
          </div>
        </div>
      </div>

      {/* Sheet lateral para form + detalhe */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">
              {selected ? `${selected.id} — ${selected.titulo}` : "Novo registro"}
            </SheetTitle>
          </SheetHeader>

          <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as typeof panelTab)} className="mt-4">
            <TabsList className="w-full grid grid-cols-5 h-8">
              <TabsTrigger value="form" className="text-xs">Dados</TabsTrigger>
              <TabsTrigger value="historico" className="text-xs" disabled={!selected}>Histórico</TabsTrigger>
              <TabsTrigger value="evidencias" className="text-xs" disabled={!selected}>Evidências</TabsTrigger>
              <TabsTrigger value="comentarios" className="text-xs" disabled={!selected}>Coment.</TabsTrigger>
              <TabsTrigger value="acoes" className="text-xs" disabled={!selected}>Ações</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-3 mt-3">
              <div className="grid gap-2.5 grid-cols-2">
                <div className="col-span-2">
                  <FormField label="Título" required><Input value={form.titulo} onChange={(event) => setField("titulo", event.target.value)} /></FormField>
                </div>
                <FormField label="Responsável" required><Input value={form.responsavel} onChange={(event) => setField("responsavel", event.target.value)} /></FormField>
                <FormField label="Unidade">
                  <Select value={form.unidade} onValueChange={(value) => setField("unidade", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{UNIT_OPTIONS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Status">
                  <Select value={form.status} onValueChange={(value) => setField("status", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Criticidade">
                  <Select value={form.criticidade} onValueChange={(value) => setField("criticidade", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CRITICALITY_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="NR"><Input value={form.nr} onChange={(event) => setField("nr", event.target.value)} /></FormField>
                <FormField label="Setor"><Input value={form.setor} onChange={(event) => setField("setor", event.target.value)} /></FormField>
                <FormField label="Função"><Input value={form.funcao} onChange={(event) => setField("funcao", event.target.value)} /></FormField>
                <FormField label="Vencimento"><Input type="date" value={form.vencimentoAt} onChange={(event) => setField("vencimentoAt", event.target.value)} /></FormField>
                <FormField label="Investimento (R$)"><Input value={form.investimento} onChange={(event) => setField("investimento", event.target.value)} /></FormField>
                <FormField label="Custo (R$)"><Input value={form.custo} onChange={(event) => setField("custo", event.target.value)} /></FormField>
                <FormField label="Risco Inerente"><Input value={form.riscoInerente} onChange={(event) => setField("riscoInerente", event.target.value)} /></FormField>
                <FormField label="Risco Residual"><Input value={form.riscoResidual} onChange={(event) => setField("riscoResidual", event.target.value)} /></FormField>
              </div>

              {moduleSchema.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2 mt-3">Campos do submódulo</h3>
                  <div className="grid gap-2.5 grid-cols-2">
                    {moduleSchema.map((field) => (
                      <div key={field.key} className={field.type === "textarea" ? "col-span-2" : ""}>
                        <FormField label={field.label} required={field.required}>
                          {field.type === "textarea" && <Textarea rows={2} placeholder={field.placeholder} value={specificForm[field.key] || ""} onChange={(event) => setSpecificField(field.key, event.target.value)} />}
                          {field.type === "select" && (
                            <Select value={specificForm[field.key] || undefined} onValueChange={(value) => setSpecificField(field.key, value)}>
                              <SelectTrigger><SelectValue placeholder={field.placeholder || "Selecione"} /></SelectTrigger>
                              <SelectContent>{(field.options || []).map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )}
                          {field.type === "number" && <Input inputMode="decimal" placeholder={field.placeholder} value={specificForm[field.key] || ""} onChange={(event) => setSpecificField(field.key, event.target.value)} />}
                          {field.type === "date" && <Input type="date" value={specificForm[field.key] || ""} onChange={(event) => setSpecificField(field.key, event.target.value)} />}
                          {field.type === "text" && <Input placeholder={field.placeholder} value={specificForm[field.key] || ""} onChange={(event) => setSpecificField(field.key, event.target.value)} />}
                        </FormField>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormField label="Observações">
                <Textarea value={form.descricao} onChange={(event) => setField("descricao", event.target.value)} rows={3} />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleNewRecord}>Limpar</Button>
                {!selected && (
                  <Button size="sm" onClick={() => void handleCreate()} className="gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </Button>
                )}
                {selected && (
                  <Button size="sm" onClick={() => void handleUpdate()} className="gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Atualizar
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historico" className="space-y-2 mt-3">
              {selectedHistorico.length === 0 && <p className="text-sm text-muted-foreground">Sem histórico registrado.</p>}
              <div className="max-h-[60vh] space-y-2 overflow-auto pr-1">
                {selectedHistorico.map((item) => (
                  <div key={item.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-sm font-medium">{item.acao}</p>
                    <p className="text-xs text-muted-foreground">{item.descricao}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.data).toLocaleString("pt-BR")} • {item.usuario}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="evidencias" className="space-y-3 mt-3">
              <Textarea placeholder="Descreva a evidência" value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} rows={2} />
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={() => void handleEvidence()} disabled={!evidenceText.trim()}>Adicionar evidência</Button>
              </div>
              <AttachmentUploader maxFiles={8} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.txt" onFilesChange={(files) => setUploadFiles(files)} />
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={() => void handleUpload()} disabled={uploadFiles.length === 0} className="gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5" /> Enviar anexos
                </Button>
              </div>
              <div className="max-h-[40vh] space-y-2 overflow-auto pr-1">
                {selectedEvidencias.length === 0 && <p className="text-sm text-muted-foreground">Sem evidências registradas.</p>}
                {selectedEvidencias.map((evidence) => (
                  <div key={evidence.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-sm font-medium">{evidence.descricao}</p>
                    <p className="text-xs text-muted-foreground">{evidence.tipo} • {evidence.responsavel} • {evidence.data}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comentarios" className="space-y-3 mt-3">
              {replyToCommentId && (
                <p className="text-xs text-muted-foreground">
                  Respondendo {replyToCommentId}
                  <Button type="button" variant="link" className="ml-1 h-auto p-0 text-xs" onClick={() => setReplyToCommentId(null)}>cancelar</Button>
                </p>
              )}
              <Textarea placeholder="Comentário" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} rows={2} />
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={handleAddComment} disabled={!commentDraft.trim()}>Comentar</Button>
              </div>
              <div className="max-h-[40vh] space-y-2 overflow-auto pr-1">
                {selectedComments.length === 0 && <p className="text-sm text-muted-foreground">Sem comentários.</p>}
                {selectedComments.map((comment) => (
                  <div key={comment.id} className="rounded-md border border-border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{comment.usuario}</p>
                      <p className="text-xs text-muted-foreground">{new Date(comment.data).toLocaleString("pt-BR")}</p>
                    </div>
                    {comment.parentId && <p className="text-xs text-muted-foreground">Resposta para {comment.parentId}</p>}
                    <p className="text-sm">{comment.texto}</p>
                    <div className="mt-1 flex justify-end">
                      <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setReplyToCommentId(comment.id)}>Responder</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="acoes" className="space-y-3 mt-3">
              {selected && (
                <>
                  <div className="grid gap-2 grid-cols-2">
                    <Button type="button" variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => void handleSetRecordStatus(selected, "EM_ANDAMENTO")}>
                      <RefreshCw className="h-3.5 w-3.5" /> Em andamento
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => void handleSetRecordStatus(selected, "ABERTO")}>
                      <RefreshCw className="h-3.5 w-3.5" /> Reabrir
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => handleDuplicateRecord(selected)}>
                      <Copy className="h-3.5 w-3.5" /> Duplicar
                    </Button>
                    <Button type="button" size="sm" className="justify-start gap-1.5 text-xs" onClick={() => void handleSetRecordStatus(selected, "CONCLUIDO")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                    </Button>
                  </div>
                  {moduleSchema.length > 0 && (
                    <div className="grid gap-2 grid-cols-2">
                      {moduleSchema.map((field) => (
                        <div key={field.key} className="rounded-md border border-border px-2.5 py-1.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{field.label}</p>
                          <p className="text-sm font-medium">
                            {selected.dadosEspecificos?.[field.key] == null || String(selected.dadosEspecificos?.[field.key]).trim() === "" ? "-" : String(selected.dadosEspecificos?.[field.key])}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SesmtModulePage;
