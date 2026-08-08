import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { VaultCredentialItem } from './CredentialVaultModal';
import { encryptSecret } from '../utils/crypto';

interface CredentialSelectorProps {
  nodeType: string;
  selectedCredentialId?: string;
  onSelectCredential: (credentialId: string) => void;
  credentials: VaultCredentialItem[];
  onOpenVault: () => void;
  onAddCredential: (cred: VaultCredentialItem) => void;
}

export const CredentialSelector: React.FC<CredentialSelectorProps> = ({
  nodeType,
  selectedCredentialId,
  onSelectCredential,
  credentials,
  onOpenVault,
  onAddCredential,
}) => {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickSecret, setQuickSecret] = useState('');
  const [quickType, setQuickType] = useState<VaultCredentialItem['type']>(
    nodeType === 'ai_agent'
      ? 'openai'
      : nodeType === 'postgres_node'
      ? 'postgres'
      : nodeType === 'github_node'
      ? 'github'
      : nodeType === 'discord_node'
      ? 'discord'
      : 'generic'
  );

  // Filter credentials relevant to the node type (or show all if generic)
  const getRelevantCredentials = () => {
    if (nodeType === 'ai_agent') {
      return credentials.filter((c) =>
        ['openai', 'gemini', 'anthropic', 'generic'].includes(c.type)
      );
    }
    if (nodeType === 'mongodb_node') {
      return credentials.filter((c) => ['mongodb', 'generic'].includes(c.type));
    }
    if (nodeType === 'postgres_node') {
      return credentials.filter((c) => ['postgres', 'generic'].includes(c.type));
    }
    if (nodeType === 'github_node') {
      return credentials.filter((c) => ['github', 'generic'].includes(c.type));
    }
    if (nodeType === 'discord_node') {
      return credentials.filter((c) => ['discord', 'slack', 'generic'].includes(c.type));
    }
    return credentials;
  };

  const relevantCredentials = getRelevantCredentials();
  const activeCred = credentials.find((c) => c.id === selectedCredentialId);

  const getServiceLabel = () => {
    switch (nodeType) {
      case 'ai_agent':
        return 'OpenAI / Gemini / Anthropic API Key';
      case 'http_request':
        return 'HTTP Authorization / API Key';
      case 'mongodb_node':
        return 'MongoDB Connection Credential';
      case 'postgres_node':
        return 'PostgreSQL Credential';
      case 'github_node':
        return 'GitHub Personal Access Token';
      case 'discord_node':
        return 'Discord Webhook Secret';
      default:
        return 'API Credential';
    }
  };

  const handleSaveQuickCredential = () => {
    if (!quickName.trim() || !quickSecret.trim()) return;

    const { encrypted } = encryptSecret(quickSecret);
    const masked =
      quickSecret.length > 8
        ? `${quickSecret.slice(0, 4)}...${quickSecret.slice(-4)}`
        : '••••••••';

    const newCred: VaultCredentialItem = {
      id: `cred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: quickName.trim(),
      type: quickType,
      maskedValue: masked,
      encrypted,
    };

    onAddCredential(newCred);
    onSelectCredential(newCred.id);
    setQuickName('');
    setQuickSecret('');
    setIsQuickCreateOpen(false);
  };

  return (
    <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3 mb-4 select-none shadow-2xs">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
            <Icons.Key className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 font-heading block">
              Credential to Authenticate With
            </span>
            <span className="text-[10px] text-slate-500 block">
              {getServiceLabel()} (AES-256 Protected)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <Icons.Plus className="w-3.5 h-3.5" />
          <span>Create New</span>
        </button>
      </div>

      {/* Select Control */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={selectedCredentialId || ''}
            onChange={(e) => {
              if (e.target.value === '__CREATE_NEW__') {
                setIsQuickCreateOpen(true);
              } else {
                onSelectCredential(e.target.value);
              }
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all shadow-2xs appearance-none pr-8 cursor-pointer"
          >
            <option value="">-- Select API Key Credential --</option>
            {relevantCredentials.map((cred) => (
              <option key={cred.id} value={cred.id}>
                🔑 {cred.name} ({cred.type.toUpperCase()}: {cred.maskedValue})
              </option>
            ))}
            {credentials.length > relevantCredentials.length && (
              <optgroup label="Other Vault Credentials">
                {credentials
                  .filter((c) => !relevantCredentials.includes(c))
                  .map((cred) => (
                    <option key={cred.id} value={cred.id}>
                      🔑 {cred.name} ({cred.type.toUpperCase()}: {cred.maskedValue})
                    </option>
                  ))}
              </optgroup>
            )}
            <option value="__CREATE_NEW__">＋ Create New Credential...</option>
          </select>
          <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={onOpenVault}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
          title="Open Vault Manager"
        >
          <Icons.ShieldCheck className="w-4 h-4 text-amber-500" />
        </button>
      </div>

      {/* Active Credential Badge or Notice */}
      {activeCred ? (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-emerald-900 block truncate">
                {activeCred.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-700 block truncate">
                AES-256 Key: {activeCred.maskedValue}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectCredential('')}
            className="text-[10px] text-slate-400 hover:text-slate-700 font-semibold px-2 py-0.5 rounded-md hover:bg-emerald-100/50 transition-colors"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2 text-amber-800">
          <Icons.AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px] font-medium leading-tight">
            No API Key Credential attached. Select an existing key or click <strong>Create New</strong> to add your API Key.
          </span>
        </div>
      )}

      {/* Inline Quick Create Modal / Form */}
      {isQuickCreateOpen && (
        <div className="pt-3 border-t border-slate-200 space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 font-heading">
              Quick Add API Key / Credential
            </span>
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(false)}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Label (e.g. OpenAI Prod Key)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
            <select
              value={quickType}
              onChange={(e) => setQuickType(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="openai">OpenAI API Key</option>
              <option value="gemini">Google Gemini API Key</option>
              <option value="anthropic">Anthropic Claude Key</option>
              <option value="mongodb">MongoDB Connection URI</option>
              <option value="postgres">PostgreSQL Conn String</option>
              <option value="github">GitHub Personal Token</option>
              <option value="discord">Discord Webhook</option>
              <option value="slack">Slack Token / Webhook</option>
              <option value="generic">Generic API Key</option>
            </select>
          </div>

          <input
            type="password"
            placeholder="Secret API Key value (e.g. sk-proj-...)"
            value={quickSecret}
            onChange={(e) => setQuickSecret(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-700 font-semibold focus:outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={handleSaveQuickCredential}
            disabled={!quickName.trim() || !quickSecret.trim()}
            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Icons.Lock className="w-3 h-3" />
            <span>Encrypt & Save Key</span>
          </button>
        </div>
      )}
    </div>
  );
};
