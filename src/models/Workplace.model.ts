import mongoose, { Document, Schema } from "mongoose";

export interface IWorkplace extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dailyWage: number;
  color: string;
}

const WorkplaceSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Kullanıcı ID zorunludur"],
    },
    name: {
      type: String,
      required: [true, "İş yeri adı zorunludur"],
      trim: true,
    },
    dailyWage: {
      type: Number,
      required: [true, "Günlük yevmiye zorunludur"],
      min: [0, "Yevmiye 0'dan küçük olamaz"],
    },
    color: {
      type: String,
      required: [true, "Renk zorunludur"],
      default: "#3B82F6", // Varsayılan mavi renk
    },
  },
  {
    timestamps: true,
  }
);

// Kullanıcı bazında sıralama için index
WorkplaceSchema.index({ userId: 1, createdAt: -1 });

const Workplace =
  mongoose.models.Workplace ||
  mongoose.model<IWorkplace>("Workplace", WorkplaceSchema);

export default Workplace;
