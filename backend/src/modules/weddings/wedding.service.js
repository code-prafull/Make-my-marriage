import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import Wedding from "./wedding.model.js";
import WeddingMember from "../members/member.model.js";

/**
 * Transactions require a replica set / mongos. Local standalone mongod
 * doesn't have them, so we detect support once and fall back to
 * sequential writes with compensation (delete on partial failure).
 */
let transactionsSupported = null;

async function detectTransactionSupport() {
  if (transactionsSupported !== null) return transactionsSupported;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    transactionsSupported = Boolean(hello.setName || hello.msg === "isdbgrid");
  } catch {
    transactionsSupported = false;
  }
  console.log(
    `[db] Transactions: ${transactionsSupported ? "supported" : "not supported (standalone) — using sequential writes"}`
  );
  return transactionsSupported;
}

async function createWeddingWithMembership(payload, userId, session) {
  const opts = session ? { session } : {};

  const [wedding] = await Wedding.create(
    [
      {
        ...payload,
        slug: Wedding.generateSlug(payload.title),
        createdBy: userId,
      },
    ],
    opts
  );

  try {
    await WeddingMember.create(
      [
        {
          wedding: wedding._id,
          user: userId,
          role: "ADMIN",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      ],
      opts
    );
  } catch (error) {
    // Compensation: never leave a wedding without its creator's membership
    if (!session) await Wedding.deleteOne({ _id: wedding._id });
    throw error;
  }

  return wedding;
}

/**
 * Creates a wedding and the creator's ADMIN membership atomically
 * (transaction when available; compensated sequential writes otherwise).
 */
export async function createWedding(payload, userId) {
  const useTransactions = await detectTransactionSupport();

  if (!useTransactions) {
    return createWeddingWithMembership(payload, userId, null);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [wedding] = await createWeddingWithMembership(payload, userId, session);
    await session.commitTransaction();
    return wedding;
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    throw error;
  } finally {
    session.endSession();
  }
}

/** All weddings where the user has an ACTIVE membership (with role). */
export async function listUserWeddings(userId) {
  const memberships = await WeddingMember.find({ user: userId, status: "ACTIVE" })
    .populate("wedding")
    .sort({ createdAt: -1 })
    .lean();

  return memberships
    .filter((m) => m.wedding)
    .map((m) => ({
      id: m.wedding._id.toString(),
      title: m.wedding.title,
      slug: m.wedding.slug,
      couple: m.wedding.couple,
      weddingDate: m.wedding.weddingDate,
      location: m.wedding.location,
      status: m.wedding.status,
      role: m.role,
      createdAt: m.wedding.createdAt,
    }));
}

/** Updates explicitly allowed fields only. */
export async function updateWedding(weddingId, payload) {
  const wedding = await Wedding.findByIdAndUpdate(
    weddingId,
    { $set: payload },
    { returnDocument: "after", runValidators: true }
  );

  if (!wedding) throw ApiError.notFound("Wedding not found");
  return wedding;
}

/** Archives instead of hard-deleting (per API doc §5.5). */
export async function archiveWedding(weddingId) {
  const wedding = await Wedding.findByIdAndUpdate(
    weddingId,
    { $set: { status: "ARCHIVED" } },
    { returnDocument: "after" }
  );

  if (!wedding) throw ApiError.notFound("Wedding not found");
  return wedding;
}

/** Safe wedding projection for API responses. */
export function toWeddingDto(wedding, role = undefined) {
  return {
    id: wedding._id.toString(),
    title: wedding.title,
    slug: wedding.slug,
    couple: wedding.couple,
    weddingDate: wedding.weddingDate,
    location: wedding.location,
    settings: wedding.settings,
    status: wedding.status,
    ...(role ? { role } : {}),
    createdAt: wedding.createdAt,
  };
}
