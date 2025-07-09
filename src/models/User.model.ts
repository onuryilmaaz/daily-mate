import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string; // Optional çünkü Google OAuth'ta şifre olmayabilir
  name: string;
  surname: string;
  provider?: string; // 'credentials' | 'google'
  googleId?: string; // Google OAuth için
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
      required: false, // Tamamen optional yapıyoruz
      select: false, // Varsayılan sorgulamalarda şifreyi dahil etme
    },
    name: {
      type: String,
      required: [true, "İsim zorunludur"],
      trim: true,
    },
    surname: {
      type: String,
      required: [true, "Soyisim zorunludur"],
      trim: true,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    googleId: {
      type: String,
      required: false, // Tamamen optional yapıyoruz
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekle
  }
);

// E-posta için unique index oluştur
UserSchema.index({ email: 1 }, { unique: true });

// Google ID için unique index oluştur
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
