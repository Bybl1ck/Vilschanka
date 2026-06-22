import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  CallbackRequest,
  CallbackRequestStatus,
  CreateCallbackRequestInput,
} from "@/types/callback-request";

const dataFile = path.join(process.cwd(), "data", "callback-requests.json");
let writeQueue: Promise<void> = Promise.resolve();

async function readRequests(): Promise<CallbackRequest[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as CallbackRequest[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeRequests(requests: CallbackRequest[]) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(requests, null, 2)}\n`, "utf8");
}

function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function getCallbackRequests(): Promise<CallbackRequest[]> {
  const requests = await readRequests();
  return requests.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function createCallbackRequest(input: CreateCallbackRequestInput): Promise<CallbackRequest> {
  return serialized(async () => {
    const requests = await readRequests();
    const callbackRequest: CallbackRequest = {
      id: randomUUID(),
      name: input.name,
      phone: input.phone,
      comment: input.comment,
      source: input.source,
      selectedDates: input.selectedDates,
      houseName: input.houseName,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    requests.unshift(callbackRequest);
    await writeRequests(requests);
    return callbackRequest;
  });
}

export function updateCallbackRequestStatus(id: string, status: CallbackRequestStatus): Promise<CallbackRequest | null> {
  return serialized(async () => {
    const requests = await readRequests();
    const index = requests.findIndex((request) => request.id === id);
    if (index === -1) return null;

    requests[index] = { ...requests[index], status };
    await writeRequests(requests);
    return requests[index];
  });
}
