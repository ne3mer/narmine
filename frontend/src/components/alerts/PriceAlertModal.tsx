'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { formatToman } from '@/lib/format';
import { getAuthToken } from '@/lib/auth';

type PriceAlertModalProps = {
  gameId?: string;
  gameTitle?: string;
  currentPrice?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingAlert?: {
    id: string;
    targetPrice: number;
    channel: 'email' | 'telegram';
    destination: string;
  } | null;
};

export function PriceAlertModal({
  gameId,
  gameTitle,
  currentPrice = 0,
  isOpen,
  onClose,
  onSuccess,
  existingAlert
}: PriceAlertModalProps) {
  const [selectedGameId, setSelectedGameId] = useState(gameId || '');
  const [selectedGame, setSelectedGame] = useState<{ id: string; title: string; price: number } | null>(
    gameId && gameTitle && currentPrice ? { id: gameId, title: gameTitle, price: currentPrice } : null
  );
  const [games, setGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [targetPrice, setTargetPrice] = useState(existingAlert?.targetPrice || currentPrice || 0);
  const [channel, setChannel] = useState<'email' | 'telegram'>(existingAlert?.channel || 'email');
  const [destination, setDestination] = useState(existingAlert?.destination || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (existingAlert) {
      setTargetPrice(existingAlert.targetPrice);
      setChannel(existingAlert.channel);
      setDestination(existingAlert.destination);
    } else {
      setTargetPrice(selectedGame?.price || currentPrice || 0);
      setChannel('email');
      setDestination('');
    }
  }, [existingAlert, currentPrice, selectedGame, isOpen]);

  useEffect(() => {
    if (isOpen && !gameId && !existingAlert) {
      fetchGames();
    }
  }, [isOpen, gameId, existingAlert]);

  const fetchGames = async () => {
    setLoadingGames(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/games`);
      if (response.ok) {
        const data = await response.json();
        setGames(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleGameSelect = (game: any) => {
    setSelectedGame({
      id: game.id || game._id,
      title: game.title,
      price: game.basePrice || 0
    });
    setSelectedGameId(game.id || game._id);
    setTargetPrice(game.basePrice || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      setLoading(false);
      return;
    }

    try {
      if (!existingAlert && !selectedGameId) {
        setError('لطفاً یک محصول انتخاب کنید');
        setLoading(false);
        return;
      }

      const url = existingAlert
        ? `${API_BASE_URL}/api/price-alerts/${existingAlert.id}`
        : `${API_BASE_URL}/api/price-alerts`;
      
      const method = existingAlert ? 'PATCH' : 'POST';
      const body = existingAlert
        ? { targetPrice, channel, destination }
        : { gameId: selectedGameId, targetPrice, channel, destination };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطا در ثبت هشدار قیمت');
      }

      setSuccess(existingAlert ? 'هشدار قیمت به‌روزرسانی شد' : 'هشدار قیمت با موفقیت ثبت شد');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت هشدار');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {existingAlert ? 'ویرایش هشدار قیمت' : 'هشدار جدید'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{gameTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {success}
            </div>
          )}

          {!gameId && !existingAlert && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                انتخاب محصول
              </label>
              {loadingGames ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                  در حال بارگذاری محصولات...
                </div>
              ) : (
                <select
                  value={selectedGameId}
                  onChange={(e) => {
                    const game = games.find(g => (g.id || g._id) === e.target.value);
                    if (game) handleGameSelect(game);
                  }}
                  required={!existingAlert}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                >
                  <option value="">انتخاب کنید...</option>
                  {games.map((game) => (
                    <option key={game.id || game._id} value={game.id || game._id}>
                      {game.title} - {formatToman(game.basePrice || 0)} تومان
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedGame && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                محصول انتخاب شده
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-bold text-slate-900">{selectedGame.title}</p>
                <p className="text-sm text-slate-600 mt-1">قیمت فعلی: {formatToman(selectedGame.price)} تومان</p>
              </div>
            </div>
          )}

          {gameId && gameTitle && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                قیمت فعلی
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900">
                {formatToman(currentPrice)} تومان
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              قیمت هدف (زیر این قیمت اعلان ارسال می‌شود)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              min={1}
              max={currentPrice}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder="مثلاً 2000000"
            />
            {selectedGame && targetPrice < selectedGame.price && (
              <p className="mt-2 text-xs text-emerald-600">
                ✓ وقتی قیمت به {formatToman(targetPrice)} تومان یا کمتر برسد، به شما اطلاع می‌دهیم
              </p>
            )}
            {selectedGame && targetPrice >= selectedGame.price && (
              <p className="mt-2 text-xs text-amber-600">
                ⚠️ قیمت هدف باید کمتر از قیمت فعلی باشد
              </p>
            )}
            {gameId && currentPrice && targetPrice < currentPrice && (
              <p className="mt-2 text-xs text-emerald-600">
                ✓ وقتی قیمت به {formatToman(targetPrice)} تومان یا کمتر برسد، به شما اطلاع می‌دهیم
              </p>
            )}
            {gameId && currentPrice && targetPrice >= currentPrice && (
              <p className="mt-2 text-xs text-amber-600">
                ⚠️ قیمت هدف باید کمتر از قیمت فعلی باشد
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              روش دریافت اعلان
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  channel === 'email'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                📧 ایمیل
              </button>
              <button
                type="button"
                onClick={() => setChannel('telegram')}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  channel === 'telegram'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                💬 تلگرام
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {channel === 'email' ? 'آدرس ایمیل' : 'یوزرنیم تلگرام'}
            </label>
            <input
              type={channel === 'email' ? 'email' : 'text'}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder={channel === 'email' ? 'example@email.com' : '@username'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !destination ||
                (!existingAlert && !selectedGameId) ||
                Boolean(selectedGame && targetPrice >= selectedGame.price) ||
                Boolean(gameId && currentPrice && targetPrice >= currentPrice)
              }
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'در حال ثبت...' : existingAlert ? 'ذخیره تغییرات' : 'ثبت هشدار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
