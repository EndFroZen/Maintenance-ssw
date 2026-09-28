import Image from "next/image";
import fixServer from "@/public/img/fixserver.png";
import logo from "@/public/img/ssw-icare-logo.png";
import BlockBlast from "./block-blast/BlockBlast";

export default function Maintenance() {
  return (
    <main className="flex flex-1 items-center justify-center bg-white p-6 text-center dark:bg-neutral-900">
      <div className="w-full max-w-4xl">
        <div>
          <p className="inline-flex items-center gap-2 text-lg font-bold text-slate-700 dark:text-slate-200">
            <Image src={logo} alt="" sizes="40px" className="h-10 w-10" priority />
            SSW iCare
          </p>

          <h1 className="mt-10 text-3xl font-bold leading-snug text-slate-700 dark:text-slate-100 sm:text-4xl">
            ขณะนี้ระบบปิดปรับปรุงชั่วคราว
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            ขออภัยในความไม่สะดวก
            <br />
            กรุณากลับมาใช้งานใหม่อีกครั้งในภายหลัง
          </p>
        </div>

        <Image
          src={fixServer}
          alt="เจ้าหน้าที่กำลังซ่อมเซิร์ฟเวอร์"
          priority
          sizes="(max-width: 640px) 90vw, 512px"
          className="mx-auto my-6 h-auto w-full max-w-lg"
        />

        <BlockBlast />
      </div>
    </main>
  );
}
