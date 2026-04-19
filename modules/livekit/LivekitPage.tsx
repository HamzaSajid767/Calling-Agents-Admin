"use client";

import { useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useStoreEffect } from "@/hooks/useStoreEffect";
import { useParticipantsBox, useRoomsBox, useSelectedRoomId } from "@/store/selectors";
import { useAppActions } from "@/store/useAppStore";
import type { LiveKitParticipant, LiveKitRoom } from "@/types/models";

export default function LivekitPage() {
  const actions = useAppActions();
  const roomsBox = useRoomsBox();
  const participantsBox = useParticipantsBox();
  const selectedRoomId = useSelectedRoomId();

  const [picked, setPicked] = useState<string | null>(null);

  useStoreEffect(() => {
    void actions.loadRooms();
  }, [actions]);

  useStoreEffect(() => {
    const roomId = picked ?? selectedRoomId;
    if (!roomId) return;
    void actions.loadParticipants(roomId);
  }, [actions, picked, selectedRoomId]);

  const rooms = roomsBox.data ?? [];

  const roomColumns: Column<LiveKitRoom>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Room",
        width: "40%",
        cell: (r) => <div className="font-mono text-sm">{r.name}</div>,
      },
      {
        key: "participants",
        header: "Participants",
        width: "18%",
        cell: (r) => <span className="text-sm">{r.numParticipants}</span>,
      },
      {
        key: "created",
        header: "Created",
        width: "22%",
        cell: (r) => <span className="text-xs text-[color:var(--muted)]">{new Date(r.createdAt).toLocaleString()}</span>,
      },
      {
        key: "actions",
        header: "",
        width: "20%",
        cell: (r) => (
          <Button
            size="sm"
            variant={picked === r.id ? "primary" : "secondary"}
            onClick={() => {
              setPicked(r.id);
              actions.selectRoom(r.id);
            }}
          >
            Inspect
          </Button>
        ),
      },
    ],
    [picked, actions],
  );

  const participants = participantsBox.data ?? [];
  const activeRoomId = picked ?? selectedRoomId;

  const participantColumns: Column<LiveKitParticipant>[] = useMemo(
    () => [
      {
        key: "identity",
        header: "Identity",
        width: "34%",
        cell: (p) => <div className="font-mono text-xs">{p.identity}</div>,
      },
      {
        key: "kind",
        header: "Kind",
        width: "12%",
        cell: (p) => <Badge tone="neutral">{p.kind}</Badge>,
      },
      {
        key: "tracks",
        header: "Tracks",
        width: "18%",
        cell: (p) => (
          <div className="text-xs text-[color:var(--muted)]">
            audio: {p.audioTracks} • video: {p.videoTracks}
          </div>
        ),
      },
      {
        key: "speaking",
        header: "Speaking",
        width: "14%",
        cell: (p) => <Badge tone={p.isSpeaking ? "good" : "neutral"}>{p.isSpeaking ? "yes" : "no"}</Badge>,
      },
      {
        key: "sync",
        header: "Transcript sync",
        width: "22%",
        cell: () => <span className="text-xs text-[color:var(--muted)]">RoomIO transcription channel (mock)</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="LiveKit rooms & participants"
        description="Active realtime rooms, participant identities, audio track counts, and transcript synchronization status."
        right={<Button variant="secondary" onClick={() => void actions.loadRooms()}>Refresh rooms</Button>}
      />

      <Card title="Rooms" subtitle="Select a room to load participants via the centralized store">
        <DataTable
          rows={rooms}
          columns={roomColumns}
          isLoading={roomsBox.loadState === "loading"}
          emptyTitle="No rooms"
          filterPlaceholder="Search room name…"
          getRowId={(r) => r.id}
          filterFn={(r, q) => r.name.toLowerCase().includes(q)}
        />
      </Card>

      <Card
        title="Participants"
        subtitle={activeRoomId ? `Room: ${activeRoomId}` : "Pick a room to inspect participants"}
        right={
          activeRoomId ? (
            <Button variant="secondary" onClick={() => void actions.loadParticipants(activeRoomId)}>
              Refresh participants
            </Button>
          ) : null
        }
      >
        {!activeRoomId ? (
          <div className="text-sm text-[color:var(--muted)]">Select a room from the table above.</div>
        ) : (
          <DataTable
            rows={participants}
            columns={participantColumns}
            isLoading={participantsBox.loadState === "loading"}
            emptyTitle="No participants"
            getRowId={(r) => r.id}
          />
        )}
      </Card>
    </div>
  );
}
