import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CertificatePublic } from "@/components/certificate/CertificatePublic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { code },
    include: {
      batch: {
        include: {
          labResults: true,
        },
      },
    },
  });

  if (!certificate) notFound();

  // Record verification
  if (!certificate.verifiedAt) {
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { verifiedAt: new Date() },
    });
  }

  return (
    <CertificatePublic
      certificate={JSON.parse(JSON.stringify(certificate))}
    />
  );
}
