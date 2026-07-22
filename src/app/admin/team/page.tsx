import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import { getClients } from "@/features/clients/data";
import InviteUserForm from "@/features/team/components/InviteUserForm";
import UserRow from "@/features/team/components/UserRow";
import { getAllUsers } from "@/features/team/data";

export default async function TeamPage() {
  const [users, clients] = await Promise.all([getAllUsers(), getClients()]);
  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
  }));

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.4fr_1fr]">
      <Panel>
        <div className="border-b border-white/8 px-6 py-4 text-sm font-medium">
          Users
        </div>
        {users.map((user) => (
          <UserRow key={user.id} user={user} clients={clientOptions} />
        ))}
        {users.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted">
            No users yet.
          </p>
        ) : null}
      </Panel>

      <Panel className="p-6">
        <MonoLabel className="mb-5">INVITE USER</MonoLabel>
        <p className="mb-5 text-[12.5px] leading-relaxed text-muted">
          No passwords involved — invited users sign in with a one-time code
          sent to their email. Client users only ever see their own workspace.
        </p>
        <InviteUserForm clients={clientOptions} />
      </Panel>
    </div>
  );
}
