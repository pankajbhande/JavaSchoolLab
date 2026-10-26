/**
 * The Pro plan, paid through Razorpay. A learner picks a plan, the server creates a Razorpay order for the price it holds (never one sent by
 * the browser), and access is granted only after the payment signature checks out, either from the browser's confirmation or from Razorpay's
 * own webhook. It owns the {@code payments} and {@code premium_access} tables.
 */
package com.javaschoollab.payment;
