import { useEffect } from 'react';
import { useCaja } from './useCaja';
import { CajaView } from './CajaView';

export function CajaPage() {
  const {
    current,
    history,
    currentMovements,
    expectedBalance,
    closeSummary,
    loading,
    error,
    open,
    close,
    fetchHistory,
    registerMovement,
    fetchCurrentMovements,
    fetchCloseSummary,
  } = useCaja();

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (current) {
      void fetchCurrentMovements();
    }
  }, [current]);

  return (
    <CajaView
      current={current}
      history={history}
      currentMovements={currentMovements}
      expectedBalance={expectedBalance}
      closeSummary={closeSummary}
      loading={loading}
      error={error}
      onOpen={open}
      onClose={close}
      onRegisterMovement={registerMovement}
      onFetchCloseSummary={fetchCloseSummary}
    />
  );
}
