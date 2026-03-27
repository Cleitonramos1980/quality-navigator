import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Save, UploadCloud } from "lucide-react";
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
  const { toast } = useToast();
  const queryHydratedModuleRef = useRef<string | null>(null);
  const skipNextPageResetRef = useRef(false);

  const moduleNode = useMemo(() => getSesmtNodeByModuleKey(moduleKey), [moduleKey]);
  const moduleSchema = useMemo(() => getSesmtFormSchema(moduleKey), [moduleKey]);
  const filterPresets = useMemo(() => getSesmtFilterPresets(moduleKey), [moduleKey]);
  const previewFields = useMemo(() => moduleSchema.slice(0, 3), [moduleSchema]);
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
  }, [moduleKey, moduleNode, favoriteHydrated, page, search, statusFilter, criticidadeFilter, unitFilter, specificFilters, sortBy, sortDir]);

  useEffect(() => {
    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
      return;
    }
    setPage(1);
  }, [moduleKey, search, statusFilter, criticidadeFilter, unitFilter, specificFilters, sortBy, sortDir]);

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
          <p className="text-sm text-muted-foreground">
            Solicite liberacao ao administrador ou acesse outro submodulo permitido.
          </p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{moduleNode?.label || "SESMT / SST"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Listagem operacional com filtros, formulario, historico e evidencias do submodulo.
        </p>
      </div>

      <SectionCard title="Filtros" description="Refine por unidade, criticidade, contexto do submodulo e ordenacao dedicada">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Buscar por titulo, responsavel ou setor"
            value={search}
            onChange={(event) => {
              setActivePresetKey(null);
              setSearch(event.target.value);
            }}
          />
          <Select
            value={unitFilter}
            onValueChange={(value) => {
              setActivePresetKey(null);
              setUnitFilter(value);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as unidades</SelectItem>
              {UNIT_OPTIONS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setActivePresetKey(null);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={criticidadeFilter}
            onValueChange={(value) => {
              setActivePresetKey(null);
              setCriticidadeFilter(value);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Criticidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as criticidades</SelectItem>
              {CRITICALITY_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input disabled value={loading ? "Carregando..." : `${records.length} em pagina / ${totalRecords} total`} />
        </div>

        <div className="mt-4 pt-4 border-t border-border grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setActivePresetKey(null);
              setSortBy(value);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Ordenar por" /></SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortDir}
            onValueChange={(value) => {
              setActivePresetKey(null);
              setSortDir(value as "asc" | "desc");
            }}
          >
            <SelectTrigger><SelectValue placeholder="Direcao" /></SelectTrigger>
            <SelectContent>
              {SORT_DIR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setActivePresetKey(null);
              setStatusFilter("ALL");
              setCriticidadeFilter("ALL");
              setUnitFilter("ALL");
              setSearch("");
              setSortBy("updatedAt");
              setSortDir("desc");
              setSpecificFilters(buildEmptySpecificForm(moduleKey));
            }}
          >
            Limpar filtros
          </Button>
        </div>

        {filterPresets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs text-muted-foreground">Presets do submodulo</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void persistFavoritePreset({
                  presetKey: activePresetKey,
                  status: statusFilter,
                  criticidade: criticidadeFilter,
                  unidade: unitFilter,
                  sortBy,
                  sortDir,
                  specificFilters,
                })}
              >
                Salvar favorito atual
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterPresets.map((preset) => (
                <Button
                  key={preset.key}
                  type="button"
                  size="sm"
                  variant={activePresetKey === preset.key ? "default" : "outline"}
                  onClick={() => applyFilterPreset(preset)}
                >
                  {favoritePresetKey === preset.key ? `Favorito • ${preset.label}` : preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {moduleSchema.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs text-muted-foreground">Filtros contextuais do submodulo</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasActiveSpecificFilters}
                onClick={() => {
                  setActivePresetKey(null);
                  setSpecificFilters(buildEmptySpecificForm(moduleKey));
                }}
              >
                Limpar contexto
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {moduleSchema.map((field) => (
                <div key={field.key}>
                  {field.type === "select" && (
                    <Select
                      value={specificFilters[field.key] || "ALL"}
                      onValueChange={(value) => setSpecificFilterField(field.key, value === "ALL" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Filtrar ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        {(field.options || []).map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === "date" && (
                    <Input
                      type="date"
                      value={specificFilters[field.key] || ""}
                      onChange={(event) => setSpecificFilterField(field.key, event.target.value)}
                    />
                  )}
                  {(field.type === "text" || field.type === "number" || field.type === "textarea") && (
                    <Input
                      placeholder={`Filtrar ${field.label.toLowerCase()}`}
                      value={specificFilters[field.key] || ""}
                      onChange={(event) => setSpecificFilterField(field.key, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Registros" description="Clique para abrir detalhes e historico">
          <div className="space-y-2 max-h-[500px] overflow-auto pr-1">
            {records.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => void openRecord(record.id)}
                className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${selected?.id === record.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
              >
                <p className="text-sm font-semibold">{record.titulo}</p>
                <p className="text-xs text-muted-foreground">{record.id} • {record.unidade} • {record.status} • {record.criticidade}</p>
                <p className="text-xs text-muted-foreground">Resp: {record.responsavel} {record.nr ? `• ${record.nr}` : ""}</p>
                {previewFields.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {previewFields.map((field) => {
                      const value = record.dadosEspecificos?.[field.key];
                      if (value == null || String(value).trim() === "") return null;
                      return (
                        <span key={field.key} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {field.label}: {String(value)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Pagina {Math.min(page, totalPages)} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Proxima
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={selected ? `Editar ${selected.id}` : "Novo registro"} description="Campos operacionais principais do submodulo">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Titulo" required><Input value={form.titulo} onChange={(event) => setField("titulo", event.target.value)} /></FormField>
            <FormField label="Responsavel" required><Input value={form.responsavel} onChange={(event) => setField("responsavel", event.target.value)} /></FormField>
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
            <FormField label="Funcao"><Input value={form.funcao} onChange={(event) => setField("funcao", event.target.value)} /></FormField>
            <FormField label="Vencimento"><Input type="date" value={form.vencimentoAt} onChange={(event) => setField("vencimentoAt", event.target.value)} /></FormField>
            <FormField label="Investimento (R$)"><Input value={form.investimento} onChange={(event) => setField("investimento", event.target.value)} /></FormField>
            <FormField label="Custo (R$)"><Input value={form.custo} onChange={(event) => setField("custo", event.target.value)} /></FormField>
            <FormField label="Risco Inerente"><Input value={form.riscoInerente} onChange={(event) => setField("riscoInerente", event.target.value)} /></FormField>
            <FormField label="Risco Residual"><Input value={form.riscoResidual} onChange={(event) => setField("riscoResidual", event.target.value)} /></FormField>
          </div>

          {moduleSchema.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Campos dedicados do submodulo</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {moduleSchema.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FormField label={field.label} required={field.required}>
                      {field.type === "textarea" && (
                        <Textarea
                          rows={3}
                          placeholder={field.placeholder}
                          value={specificForm[field.key] || ""}
                          onChange={(event) => setSpecificField(field.key, event.target.value)}
                        />
                      )}
                      {field.type === "select" && (
                        <Select
                          value={specificForm[field.key] || undefined}
                          onValueChange={(value) => setSpecificField(field.key, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || "Selecione"} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || []).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.type === "number" && (
                        <Input
                          inputMode="decimal"
                          placeholder={field.placeholder}
                          value={specificForm[field.key] || ""}
                          onChange={(event) => setSpecificField(field.key, event.target.value)}
                        />
                      )}
                      {field.type === "date" && (
                        <Input
                          type="date"
                          value={specificForm[field.key] || ""}
                          onChange={(event) => setSpecificField(field.key, event.target.value)}
                        />
                      )}
                      {(field.type === "text") && (
                        <Input
                          placeholder={field.placeholder}
                          value={specificForm[field.key] || ""}
                          onChange={(event) => setSpecificField(field.key, event.target.value)}
                        />
                      )}
                    </FormField>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FormField label="Descricao">
            <Textarea value={form.descricao} onChange={(event) => setField("descricao", event.target.value)} rows={4} />
          </FormField>

          <div className="flex justify-end gap-2">
            {!selected && (
              <Button onClick={() => void handleCreate()} className="gap-2">
                <Save className="w-4 h-4" />
                Criar Registro
              </Button>
            )}
            {selected && (
              <Button onClick={() => void handleUpdate()} className="gap-2">
                <Save className="w-4 h-4" />
                Atualizar Registro
              </Button>
            )}
          </div>
        </SectionCard>
      </div>

      {selected && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Evidencias" description="Inclua evidencias e acompanhe o historico">
              <div className="space-y-2 mb-3">
                <Textarea placeholder="Descreva a evidencia..." value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} rows={3} />
                <Button onClick={() => void handleEvidence()}>Adicionar Evidencia</Button>
              </div>
              <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                {selectedEvidencias.map((evidence) => (
                  <div key={evidence.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-sm font-medium">{evidence.descricao}</p>
                    <p className="text-xs text-muted-foreground">{evidence.tipo} • {evidence.responsavel} • {evidence.data}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Anexos e Historico" description="Upload de anexos com metadados e trilha de alteracoes">
              <AttachmentUploader
                maxFiles={8}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.txt"
                onFilesChange={(files) => setUploadFiles(files)}
              />
              <div className="flex justify-end mt-3">
                <Button onClick={() => void handleUpload()} disabled={uploadFiles.length === 0} className="gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Enviar Anexos
                </Button>
              </div>

              <div className="space-y-2 mt-4 max-h-[240px] overflow-auto pr-1">
                {selectedHistorico.map((item) => (
                  <div key={item.id} className="rounded-md border border-border px-3 py-2">
                    <p className="text-sm font-medium">{item.acao}</p>
                    <p className="text-xs text-muted-foreground">{item.descricao}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.data).toLocaleString("pt-BR")} • {item.usuario}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {moduleSchema.length > 0 && (
            <SectionCard title="Resumo de Campos Dedicados" description="Valores especificos persistidos neste registro">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {moduleSchema.map((field) => (
                  <div key={field.key} className="rounded-md border border-border px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium mt-1">
                      {selected.dadosEspecificos?.[field.key] == null || String(selected.dadosEspecificos?.[field.key]).trim() === ""
                        ? "-"
                        : String(selected.dadosEspecificos?.[field.key])}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {lookupSummary && (
        <SectionCard title="Contexto de Cadastros" description="Dados auxiliares e escopo de unidade para o perfil logado">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-md border border-border px-3 py-2">Unidades: {Array.isArray(lookupSummary.unidades) ? lookupSummary.unidades.length : 0}</div>
            <div className="rounded-md border border-border px-3 py-2">Setores: {Array.isArray(lookupSummary.setores) ? lookupSummary.setores.length : 0}</div>
            <div className="rounded-md border border-border px-3 py-2">Colaboradores: {Array.isArray(lookupSummary.colaboradores) ? lookupSummary.colaboradores.length : 0}</div>
            <div className="rounded-md border border-border px-3 py-2">Profissionais SESMT: {Array.isArray(lookupSummary.profissionaisSesmt) ? lookupSummary.profissionaisSesmt.length : 0}</div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default SesmtModulePage;



