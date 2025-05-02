import { describe, it, expect, vi, beforeEach } from "vitest";
import { execute } from "../../src/commands/vouch.js";
import { vouchCooldowns } from "../../src/config/cache.js";
import { ROLES } from "../../src/config/roles.js";
import { db } from "../../src/db/client.js";

// Mock the already-initialized Prisma client used by the bot
vi.mock("../../src/db/client.js", () => ({
  db: {
    vouch: {
      create: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vouchCooldowns.clear();
  vi.clearAllMocks();
});

function createMockInteraction({ voucherRoles = [], targetRoles = [] } = {}) {
  return {
    user: { id: "voucher123", username: "VoucherUser" },
    member: {
      user: { tag: "VoucherUser#0001" },
      roles: {
        cache: new Map(voucherRoles.map((id) => [id, { id }])),
      },
    },
    guild: {
      roles: { cache: new Map([[ROLES.PATRONS, { name: "Patrons" }]]) },
      members: {
        fetch: vi.fn().mockResolvedValue({
          id: "target123",
          roles: {
            cache: new Map(targetRoles.map((id) => [id, { id }])),
            add: vi.fn(),
          },
        }),
      },
    },
    options: {
      getUser: () => ({ id: "target123", username: "TargetUser" }),
    },
    reply: vi.fn(),
  };
}

describe("/vouch", () => {
  it("allows a valid user to vouch", async () => {
    const interaction = createMockInteraction({
      voucherRoles: [ROLES.REGULARS],
      targetRoles: [],
    });

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("✅"),
        flags: expect.any(Number),
      })
    );

    expect(db.vouch.create).toHaveBeenCalledWith({
      data: {
        userId: "target123",
        vouchedBy: "voucher123",
      },
    });
  });

  it("prevents vouching during cooldown", async () => {
    const interaction = createMockInteraction({
      voucherRoles: [ROLES.REGULARS],
      targetRoles: [],
    });

    vouchCooldowns.set("voucher123", Date.now());

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("⏳"),
        flags: expect.any(Number),
      })
    );

    expect(db.vouch.create).not.toHaveBeenCalled();
  });

  it("prevents vouching for trusted users", async () => {
    const interaction = createMockInteraction({
      voucherRoles: [ROLES.REGULARS],
      targetRoles: [ROLES.REGULARS],
    });

    await execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("already vouched for"),
        flags: expect.any(Number),
      })
    );

    expect(db.vouch.create).not.toHaveBeenCalled();
  });
});
