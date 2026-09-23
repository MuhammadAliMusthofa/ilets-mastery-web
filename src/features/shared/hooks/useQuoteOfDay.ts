"use client";

import { useQuery } from "@tanstack/react-query";
import { quoteOfDayService } from "../services/quotes.service";

export const QUOTE_TODAY_KEY = ["quotes", "today"] as const;

export const useQuoteOfDay = () =>
  useQuery({ queryKey: QUOTE_TODAY_KEY, queryFn: quoteOfDayService.today, staleTime: 60 * 60 * 1000 });
