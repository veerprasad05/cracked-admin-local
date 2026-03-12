import TextType from "@/ui/TextType";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HelloWorldPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center">
      <div className="rounded-[2rem] bg-[#15151b]/75 px-8 py-12 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur">
        <h1 className="text-center text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          <TextType
            text={["Hello World!", "Crackd Admin"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="_"
            deletingSpeed={50}
            variableSpeed={{ min: 60, max: 120 }}
            cursorBlinkDuration={0.5}
          />
        </h1>
      </div>
    </section>
  );
}
