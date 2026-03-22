import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";
import { PetstoreClient } from "../api/petstore-client";

const client = new PetstoreClient();
let createdPets: number[] = [];
let createdOrders: number[] = [];

async function tryDelete(deleteFn: () => Promise<{ status: number }>) {
  try {
    const response = await deleteFn();
    return [200, 204].includes(response.status);
  } catch {
    return false;
  }
}

async function getStatus(promise: Promise<unknown>) {
  try {
    return ((await promise) as { status: number }).status;
  } catch (e) {
    return axios.isAxiosError(e) && e.response ? e.response.status : 0;
  }
}

beforeAll(async () => {
  const baseId = Date.now() % 1000000;

  for (let i = 0; i < 4; i++) {
    const response = await client.createPet(`TestPet_${baseId}_${i}`, baseId + i, "available");
    expect(response.status).toBe(200);
    createdPets.push(response.data?.id);
  }

  let orderIndex = 0;
  for (const petId of createdPets) {
    for (let i = 0; i < 2; i++) {
      const orderId = baseId + orderIndex++;
      const response = await client.placeOrder(petId, 1, orderId);
      expect(response.status).toBe(200);
      createdOrders.push(response.data?.id);
    }
  }
});

describe("Create pets", () => {
  it("4 pets with available status", async () => {
    expect(createdPets).toHaveLength(4);
    for (const id of createdPets) {
      const response = await client.getPet(id);
      expect(response.status).toBe(200);
      expect(response.data.status).toBe("available");
    }
  });
});

describe("Edge cases", () => {
  it("non-existent pet returns 404", async () => {
    const status = await getStatus(client.getPet(1999999999999));
    expect(status).toBe(404);
  });
});

describe("Create orders", () => {
  it("2 orders per pet, 8 total", async () => {
    expect(createdOrders).toHaveLength(8);
    for (const id of createdOrders) {
      const response = await client.getOrder(id);
      expect(response.status).toBe(200);
    }
  });
});

describe("Cleanup", () => {
  it("deletes orders and pets", async () => {
    for (const id of createdOrders) await tryDelete(() => client.deleteOrder(id));
    for (const id of createdPets) await tryDelete(() => client.deletePet(id));
  });

  it("deleted pets return 404", async () => {
    for (const id of createdPets) {
      expect(await getStatus(client.getPet(id))).toBe(404);
    }
  });

  it("deleted orders return 404", async () => {
    for (const id of createdOrders) {
      expect(await getStatus(client.getOrder(id))).toBe(404);
    }
  });
});

describe("Found API bugs", () => {
  it("BUG: accepts any pet status instead of returning 405", async () => {
    const response = await client.createPet("FakePet", undefined, "fake_invalid_status");
    // expected: 405 per Swagger spec
    expect(response.status).toBe(405);
  });

});
