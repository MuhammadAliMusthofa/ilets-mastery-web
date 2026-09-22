"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import { PillTabs, SectionTitle } from "@/src/_global/components/Showcase/Showcase";
import { SKILL_COLOR } from "@/src/_global/design/tokens";
import { useExamPackages } from "../hooks/useExam";
import { MockCardGrid } from "../components/MockCard";
import { SKILLS, SKILL_LABELS, type Skill } from "@/src/models/ielts";

type Filter = Skill | "all";

export default function MockTestListContainer() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: packages, isLoading, isError } = useExamPackages();

  const filtered = (packages ?? []).filter((pkg) => filter === "all" || pkg.skills.includes(filter));
  const fullTests = filtered.filter((pkg) => pkg.package_type === "FULL");
  const practice = filtered.filter((pkg) => pkg.package_type === "SECTION");

  return (
    <>
      <PageHeader
        title="Practise like it's test day"
        description="IELTS General Training simulations with a server-side timer, autosaved answers and a band estimate the moment you submit."
      >
        <PillTabs<Filter>
          label="Filter by skill"
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: "All", count: packages?.length },
            ...SKILLS.map((skill) => ({ id: skill, label: SKILL_LABELS[skill], dot: SKILL_COLOR[skill].bg })),
          ]}
        />
      </PageHeader>

      <PageBody>
        {isLoading && (
          <p className="flex items-center gap-2 text-[15px] text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Loading tests…
          </p>
        )}
        {isError && (
          <p className="text-[15px] text-[#b12a41]">Couldn't load the tests. Reload the page to try again.</p>
        )}

        {packages && (
          <div className="space-y-16">
            <section aria-labelledby="full-tests">
              <SectionTitle
                id="full-tests"
                title="Full test"
                description="All four skills in order: Listening, Reading, Writing, then Speaking."
              />
              <MockCardGrid
                packages={fullTests}
                emptyText={filter === "all" ? "No full tests have been published yet." : "No full tests for this skill."}
              />
            </section>

            <section aria-labelledby="practice-tests">
              <SectionTitle
                id="practice-tests"
                title="Practice by skill"
                description="One skill, less time. Ideal for patching up your weakest area."
              />
              <MockCardGrid
                packages={practice}
                emptyText={filter === "all" ? "No practice tests have been published yet." : "No practice tests for this skill yet."}
              />
            </section>
          </div>
        )}
      </PageBody>
    </>
  );
}
