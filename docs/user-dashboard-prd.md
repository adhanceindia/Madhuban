# Product Requirements Document (PRD)

## Customer Authentication & Dashboard

**Project:** Madhuban Garden Resort
**Version:** 1.0
**Status:** Ready for Design & Development

---

# Overview

Build a **Customer Authentication System** and **Customer Dashboard** for Madhuban Garden Resort.

This dashboard is **not** an admin panel. It is a premium guest portal where customers can securely access and manage their bookings after making a reservation.

The experience should be simple, elegant, and consistent with the premium branding of Madhuban Garden Resort.

The attached UI design should be treated as the **primary design reference** for layout, information hierarchy, spacing, and user flow.

---

# Design Reference

**IMPORTANT**

Use the attached UI mockup as the baseline reference for the implementation.

The overall layout, navigation, spacing, card hierarchy, authentication flow, and dashboard structure should closely follow the attached design while adapting it to our existing design system and brand.

Do **not** redesign the experience from scratch.

Instead:

* Follow the same overall screen flow.
* Maintain the same clean and premium aesthetic.
* Improve details where necessary.
* Keep interactions polished and production-ready.

---

# Objectives

The dashboard should allow customers to:

* Access their account
* View all bookings
* View booking details
* View booking status
* View payment status
* Download booking confirmations
* Download invoices
* Manage their profile
* Receive booking-related notifications

The dashboard should **not** include operational or administrative functionality.

---

# Authentication Flow

## Entry Screen

Customer enters their email address.

After submitting the email:

### Existing Customer

Present two sign-in options:

* Continue with Email OTP (Primary)
* Sign in with Password (Secondary)

---

### New Customer

If an account does not exist:

Display:

> No account found.

Allow customer to create an account.

---

# Account Creation

Collect:

* Full Name
* Phone Number
* Email Address
* Password

After successful account creation:

Redirect directly to Dashboard.

---

# Dashboard Structure

## Dashboard

Display:

* Welcome message
* Upcoming booking
* Booking Status
* Payment Status

Quick actions:

* View Booking
* Book Another Stay

When there are no bookings:

Display a premium empty state encouraging guests to explore rooms.

---

## My Bookings

Display bookings as modern cards.

Each booking should display:

* Room Image
* Room Name
* Booking ID
* Check-in
* Check-out
* Guest Count
* Booking Status
* Payment Status

Filters:

* Upcoming
* Completed
* Cancelled
* All

---

## Booking Details

Display:

### Reservation Summary

* Booking ID
* Booking Date
* Booking Status
* Payment Status

---

### Stay Details

* Room Images
* Room Name
* Check-in
* Check-out
* Guest Count

---

### Payment Summary

* Total Amount
* Amount Paid
* Remaining Amount

---

### Guest Details

* Guest Name
* Email
* Phone

---

### Special Requests

Display notes submitted during booking.

---

Actions:

* Download Booking Confirmation
* Download Invoice
* Contact Resort

---

## Notifications

Display important updates only.

Examples:

* Booking Confirmed
* Payment Successful
* Booking Cancelled
* Booking Completed
* Invoice Generated

Notifications should be simple, readable, and chronological.

---

## Profile

Allow customers to update:

* Name
* Email
* Phone Number
* Address

Additional actions:

* Change Password
* Logout

---

# Navigation

Sidebar navigation should contain:

* Dashboard
* My Bookings
* Notifications
* Profile
* Book a Stay
* Logout

Navigation should remain minimal.

---

# Design Principles

## Overall Experience

The interface should feel:

* Premium
* Calm
* Elegant
* Spacious
* Nature-inspired
* Modern
* Easy to understand

Avoid making it feel like an enterprise dashboard or hotel management software.

The experience should feel closer to a luxury hospitality brand than a SaaS application.

---

## Typography

Reuse the typography already used across the public website.

Do **not** introduce new font families.

Maintain visual consistency between the marketing website and the customer dashboard.

Typography should emphasize:

* Large welcoming headings
* Clear section titles
* Comfortable reading sizes
* Strong hierarchy
* Excellent legibility

---

## Colors

Reuse the existing color palette already established on the website.

Do **not** introduce a new color system.

Use the current brand colors for:

* Primary buttons
* Success states
* Navigation highlights
* Links
* Status badges

Use existing neutral colors for:

* Backgrounds
* Cards
* Borders
* Dividers

The customer dashboard should feel like a natural extension of the existing website.

---

## Components

Follow the same design language already used throughout the application.

Use:

* Rounded cards
* Soft shadows
* Spacious layouts
* High-quality room imagery
* Clean iconography
* Consistent button styles
* Consistent form controls

---

## Responsive Design

The experience must be fully responsive.

Support:

* Desktop
* Tablet
* Mobile

Mobile layouts should not simply shrink desktop screens.

Instead, adapt layouts for touch interactions and smaller viewports while preserving the overall design language.

---

# User Experience Principles

The application should prioritize:

* Simplicity
* Discoverability
* Minimal clicks
* Clear navigation
* Fast task completion
* Consistent interactions

Customers should always know:

* Their upcoming stay
* Booking status
* Payment status
* What actions are available

---

# Empty States

Every page should include meaningful empty states.

Examples:

* No bookings yet
* No notifications
* No upcoming reservations

Each empty state should encourage the next logical action.

---

# Micro Interactions

Include polished interactions throughout the dashboard:

* Smooth page transitions
* Hover states
* Loading skeletons
* Success feedback
* Error feedback
* Subtle animations
* Button loading states

Animations should remain subtle and premium.

---

# Accessibility

Ensure the dashboard is:

* Keyboard accessible
* Screen-reader friendly
* High contrast where required
* Properly labeled
* Easy to use across devices

---

# Scope

## Included

* Authentication
* Customer Dashboard
* My Bookings
* Booking Details
* Notifications
* Profile
* Booking Confirmation
* Invoice View

## Not Included

Do **not** implement:

* Chat
* Loyalty Programs
* Rewards
* Memberships
* Digital Check-in
* Concierge
* Guest Service Requests
* Restaurant Reservations
* Event Booking Management
* Complex Customer Settings

The objective is to create a **production-ready, premium customer dashboard** that integrates seamlessly with the existing Madhuban Garden Resort website, using the attached UI as the primary design reference and maintaining complete visual consistency with the current brand and design system.
