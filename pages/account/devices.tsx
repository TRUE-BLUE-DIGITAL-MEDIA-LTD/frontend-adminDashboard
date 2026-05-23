import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  ListTrustedDevicesService,
  RevokeTrustedDeviceService,
  TrustedDeviceItem,
} from '../../services/auth/trusted-devices';

function relativeFromNow(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (abs < min) return ms < 0 ? 'just now' : 'in <1 min';
  if (abs < hr) return ms < 0 ? `${Math.round(abs / min)} min ago` : `in ${Math.round(abs / min)} min`;
  if (abs < day) return ms < 0 ? `${Math.round(abs / hr)} h ago` : `in ${Math.round(abs / hr)} h`;
  return ms < 0 ? `${Math.round(abs / day)} d ago` : `in ${Math.round(abs / day)} d`;
}

export default function TrustedDevicesPage() {
  const [devices, setDevices] = useState<TrustedDeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await ListTrustedDevicesService();
      setDevices(list);
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err?.message ?? 'Failed to load', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (d: TrustedDeviceItem) => {
    const confirm = await Swal.fire({
      title: d.isCurrent ? 'Revoke THIS device?' : 'Revoke this device?',
      text: d.isCurrent
        ? 'Your next sign-in from this browser will require TOTP again.'
        : 'The device will no longer be trusted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Revoke',
    });
    if (!confirm.isConfirmed) return;
    try {
      await RevokeTrustedDeviceService(d.id);
      await load();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err?.message ?? 'Failed to revoke', icon: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 font-Poppins">
      <h1 className="mb-4 text-2xl font-semibold">Trusted Devices</h1>
      <p className="mb-6 text-sm text-slate-600">
        Devices listed here can sign in without being prompted for a TOTP code.
        Revoke any device you don&apos;t recognize.
      </p>

      {loading && <div className="text-slate-500">Loading…</div>}

      {!loading && devices.length === 0 && (
        <div className="rounded-md bg-slate-50 p-6 text-center text-slate-600">
          No trusted devices yet.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {devices.map((d) => (
          <li
            key={d.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {d.browser ?? 'Unknown browser'}
                    {d.os ? ` on ${d.os}` : ''}
                  </span>
                  {d.isCurrent && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      This device
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Last seen {relativeFromNow(d.lastSeenAt)}
                </div>
                <div className="text-sm text-slate-600">
                  {d.lastIp ?? '—'}
                  {(d.city || d.country) && ' · '}
                  {[d.city, d.country].filter(Boolean).join(', ')}
                </div>
                <div className="text-xs text-slate-500">
                  Expires {relativeFromNow(d.expiresAt)}
                </div>
              </div>
              <button
                onClick={() => revoke(d)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Revoke
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
