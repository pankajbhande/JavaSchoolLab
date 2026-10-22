/**
 * The account owner's rights over their own data: download everything the site holds about them, and delete the account.
 * This is the one place that deliberately spans every table that carries a user id (see AccountRepository); it only reads and deletes,
 * and the learner-facing services stay unaware of it.
 */
package com.javaschoollab.account;
