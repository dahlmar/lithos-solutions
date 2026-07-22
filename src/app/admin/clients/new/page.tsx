import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import ClientForm from "@/features/clients/components/ClientForm";

export default function NewClientPage() {
  return (
    <Panel className="max-w-[560px] p-7">
      <MonoLabel className="mb-6">NEW CLIENT</MonoLabel>
      <ClientForm />
    </Panel>
  );
}
