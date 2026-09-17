import { useEffect, useMemo, useState } from "react";
import {
  getAccount,
  getInsights,
  getTransactionSummary,
  getTransactions,
  getUserAccounts,
} from "../api/bankingApi";

export function useBankingData(userId) {
  const [accountsPayload, setAccountsPayload] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      if (!userId) {
        setAccountsPayload(null);
        setSelectedAccountId("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const payload = await getUserAccounts(userId);
        if (!active) {
          return;
        }

        setAccountsPayload(payload);
        const firstAccountId = payload.accounts[0]?.account_id;
        setSelectedAccountId((currentAccountId) => {
          const currentStillExists = payload.accounts.some(
            (item) => String(item.account_id) === String(currentAccountId),
          );
          return currentStillExists ? currentAccountId : firstAccountId ? String(firstAccountId) : "";
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setAccountsPayload(null);
        setSelectedAccountId("");
        setError(requestError.message);
        setLoading(false);
      }
    }

    loadAccounts();

    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  useEffect(() => {
    let active = true;

    async function loadSelectedAccount() {
      if (!selectedAccountId) {
        setAccount(null);
        setTransactions([]);
        setSummary(null);
        setInsights(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [accountPayload, transactionsPayload, summaryPayload, insightsPayload] = await Promise.all([
          getAccount(selectedAccountId),
          getTransactions(selectedAccountId),
          getTransactionSummary(selectedAccountId),
          getInsights(selectedAccountId),
        ]);

        if (!active) {
          return;
        }

        setAccount(accountPayload);
        setTransactions(transactionsPayload.transactions ?? []);
        setSummary(summaryPayload);
        setInsights(insightsPayload);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setAccount(null);
        setTransactions([]);
        setSummary(null);
        setInsights(null);
        setError(requestError.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSelectedAccount();

    return () => {
      active = false;
    };
  }, [selectedAccountId, refreshKey]);

  const accounts = accountsPayload?.accounts ?? [];
  const user = accountsPayload?.user ?? account?.user ?? null;
  const selectedAccount = useMemo(
    () => accounts.find((item) => String(item.account_id) === String(selectedAccountId)) ?? account,
    [account, accounts, selectedAccountId],
  );

  return {
    account,
    accounts,
    error,
    insights,
    loading,
    selectedAccount,
    selectedAccountId,
    setSelectedAccountId,
    refreshData: () => setRefreshKey((key) => key + 1),
    setError,
    summary,
    transactions,
    user,
    userId,
  };
}
