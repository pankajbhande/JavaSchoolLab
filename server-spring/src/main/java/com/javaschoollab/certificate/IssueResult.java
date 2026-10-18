package com.javaschoollab.certificate;

/** The certificate asked for, and whether this call created it (201) or it already existed (200). */
public record IssueResult(Certificate certificate, boolean created) {}
