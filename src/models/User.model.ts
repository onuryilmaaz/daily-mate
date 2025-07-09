import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "E-posta adresi zorunludur"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      select: false, // Varsayılan sorgulamalarda şifreyi dahil etme
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekle
  }
);

// E-posta için unique index oluştur
UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
