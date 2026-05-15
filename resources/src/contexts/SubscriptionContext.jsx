// resources/js/contexts/SubscriptionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { loadStripe } from '@stripe/stripe-js';

const SubscriptionContext = createContext({});

export const useSubscription = () => useContext(SubscriptionContext);

// Make sure to add VITE_STRIPE_PUBLIC_KEY to your .env file

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY).catch(err => {
    console.error('Failed to load Stripe:', err);
    return null;
});

export const SubscriptionProvider = ({ children }) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        fetchSubscriptionStatus();
        fetchPlans();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await api.get('/subscription/status');
            setSubscriptionStatus(response.data);
        } catch (err) {
            console.error('Failed to fetch subscription status:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/subscription/plans');
            // Convert object to array if needed
            const plansArray = Array.isArray(response.data) 
                ? response.data 
                : Object.values(response.data);
            setPlans(plansArray);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get('/subscription/payment-methods');
            setPaymentMethods(response.data);
        } catch (err) {
            console.error('Failed to fetch payment methods:', err);
        }
    };

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/subscription/invoices');
            setInvoices(response.data);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        }
    };

    const subscribe = async (plan, successUrl, cancelUrl) => {
        try {
            const response = await api.post('/subscription/create-checkout', {
                plan,
                success_url: successUrl,
                cancel_url: cancelUrl,
            });
            
            const stripe = await stripePromise;
            
            
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err) {
            console.error('Subscription failed:', err);
            throw err;
        }
    };

    const cancelSubscription = async () => {
        try {
            const response = await api.post('/subscription/cancel');
            await fetchSubscriptionStatus();
            return response.data;
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
            throw err;
        }
    };

    const manageBilling = async (returnUrl) => {
        try {
            const response = await api.post('/subscription/portal', { return_url: returnUrl });
            window.location.href = response.data.url;
        } catch (err) {
            console.error('Failed to open billing portal:', err);
            throw err;
        }
    };

    // Also create the missing Subscription and SubscriptionSuccess pages
    const value = {
        subscriptionStatus,
        plans,
        loading,
        paymentMethods,
        invoices,
        subscribe,
        cancelSubscription,
        manageBilling,
        fetchPaymentMethods,
        fetchInvoices,
        fetchSubscriptionStatus,
        isPremium: subscriptionStatus?.is_premium || false,
        hasActiveSubscription: subscriptionStatus?.has_active_subscription || false,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};