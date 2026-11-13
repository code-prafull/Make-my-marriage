import ApiError from "../../utils/ApiError.js";
import WeddingMember from "./member.model.js";

/** Lists ACTIVE + PENDING members of a wedding. */
export async function listMembers(weddingId) {
  const members = await WeddingMember.find({ wedding: weddingId })
    .populate("user", "name email avatar")
    .populate("invitedBy", "name email")
    .sort({ createdAt: 1 })
    .lean();

  return members.map((m) => ({
    id: m._id.toString(),
    user: m.user
      ? { id: m.user._id.toString(), name: m.user.name, email: m.user.email, avatar: m.user.avatar }
      : null,
    role: m.role,
    status: m.status,
    joinedAt: m.joinedAt,
    createdAt: m.createdAt,
  }));
}

/** Removes a member (ADMIN action). The sole ADMIN cannot be removed. */
export async function removeMember(weddingId, memberId) {
  const member = await WeddingMember.findOne({ _id: memberId, wedding: weddingId });
  if (!member) throw ApiError.notFound("Member not found");

  if (member.role === "ADMIN") {
    const adminCount = await WeddingMember.countDocuments({
      wedding: weddingId,
      role: "ADMIN",
      status: "ACTIVE",
    });
    if (adminCount <= 1) {
      throw ApiError.badRequest("The last administrator cannot be removed");
    }
  }

  member.status = "REMOVED";
  await member.save();

  return member;
}
