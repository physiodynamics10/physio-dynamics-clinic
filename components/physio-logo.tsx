import Image from "next/image";

export default function PhysioLogo({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  return (
    <div
      className={`flex items-center ${
        collapsed ? "justify-center" : "gap-3"
      }`}
    >
      <Image
        src="/physio-logo.png"
        alt="Physio Dynamics"
        width={46}
        height={46}
        priority
        className="h-11 w-11 object-contain rounded-lg"
      />

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight text-[#056B7D]">
            Physio Dynamics
          </p>

          <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-[#0692AB]">
            Physiotherapy & Rehabilitation
          </p>
        </div>
      )}
    </div>
  );
}
