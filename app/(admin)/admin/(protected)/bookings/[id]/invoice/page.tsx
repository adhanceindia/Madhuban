import { notFound } from 'next/navigation'
import { getBookingDetail } from '@/db/queries/bookings-admin'
import { getSiteSettings } from '@/db/queries/settings'
import { formatINR, formatDate, nightsBetween } from '@/lib/format'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await getBookingDetail(parseInt(id))
  
  if (!booking) {
    notFound()
  }

  const settingsData = await getSiteSettings('invoice_settings')
  const settings = (settingsData || {}) as Record<string, string>

  const nights = nightsBetween(booking.check_in, booking.check_out)
  const subtotal = booking.total_amount ? Math.round(booking.total_amount / 1.12) : 0
  const gst = (booking.total_amount || 0) - subtotal

  return (
    <div className="bg-white min-h-screen p-8 text-black print:p-0">
      <div className="max-w-[800px] mx-auto border border-gray-200 rounded-lg p-10 print:border-none print:shadow-none print:max-w-full print:p-0">
        
        {/* Print Button (Hidden when printing) */}
        <div className="flex justify-end mb-8 print:hidden">
          <button
            type="button"
            className="px-4 py-2 bg-sage text-white text-sm font-semibold rounded-lg hover:bg-sage-deep transition-colors"
          >
            Print Invoice
          </button>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold text-sage-deep mb-2">
              {settings.business_name || 'Madhuban Garden Resort'}
            </h1>
            <p className="text-sm text-gray-600 whitespace-pre-line max-w-[250px]">
              {settings.address || 'Agar Malwa District, Madhya Pradesh, India'}
            </p>
            {settings.phone && <p className="text-sm text-gray-600 mt-1">Phone: {settings.phone}</p>}
            {settings.email && <p className="text-sm text-gray-600">Email: {settings.email}</p>}
            {settings.gstin && <p className="text-sm font-medium mt-2">GSTIN: {settings.gstin}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-300 tracking-wider uppercase">Invoice</h2>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><span className="font-medium text-gray-900">Invoice No:</span> #{booking.id}</p>
              <p><span className="font-medium text-gray-900">Date:</span> {formatDate(new Date().toISOString())}</p>
              <p><span className="font-medium text-gray-900">Status:</span> <span className="uppercase">{booking.payment_status}</span></p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12 border-t border-gray-100 pt-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
          <p className="text-lg font-semibold text-gray-900">{booking.guest_name}</p>
          <p className="text-sm text-gray-600 mt-1">{booking.guest_email}</p>
          <p className="text-sm text-gray-600">+91 {booking.guest_phone}</p>
        </div>

        {/* Booking Details */}
        <div className="mb-8 border-t border-gray-100 pt-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Stay Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Check-in</p>
              <p className="font-medium">{formatDate(booking.check_in)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Check-out</p>
              <p className="font-medium">{formatDate(booking.check_out)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Room</p>
              <p className="font-medium">{booking.room_name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Duration</p>
              <p className="font-medium">{nights} nights, {booking.guests_count} guests</p>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="mb-12 border-t border-gray-100 pt-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 font-semibold text-gray-900">Description</th>
                <th className="py-3 font-semibold text-gray-900 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 text-gray-600">Room Charges ({nights} nights)</td>
                <td className="py-4 text-gray-900 text-right font-medium">{formatINR(subtotal)}</td>
              </tr>
              <tr>
                <td className="py-4 text-gray-600">GST (12%)</td>
                <td className="py-4 text-gray-900 text-right font-medium">{formatINR(gst)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900">
                <td className="py-4 font-bold text-gray-900 text-lg">Total Amount</td>
                <td className="py-4 font-bold text-gray-900 text-right text-lg">{formatINR(booking.total_amount || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Terms */}
        {(settings.terms || booking.gateway_order_id) && (
          <div className="border-t border-gray-100 pt-8 text-xs text-gray-500">
            {booking.gateway_order_id && (
              <p className="mb-4 text-gray-400">Payment Reference: {booking.gateway_order_id}</p>
            )}
            {settings.terms && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
                <p className="whitespace-pre-line">{settings.terms}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Auto Print Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.querySelector('button').addEventListener('click', function() {
                window.print();
              });
            `,
          }}
        />
      </div>
    </div>
  )
}
