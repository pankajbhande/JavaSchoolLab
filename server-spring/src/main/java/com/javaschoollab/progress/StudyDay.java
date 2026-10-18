package com.javaschoollab.progress;

import java.time.LocalDate;

/** Seconds studied on one calendar day. */
public record StudyDay(LocalDate date, int seconds) {}
