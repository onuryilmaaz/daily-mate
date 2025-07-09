import mongoose, { Document, Schema } from "mongoose";

export interface IWorkDay extends Document {
  userId: mongoose.Types.ObjectId;
  workplaceId: mongoose.Types.ObjectId;
  date: Date;
  wageOnThatDay: number;
}

const WorkDaySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Kullanıcı ID zorunludur"],
    },
    workplaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workplace",
      required: [true, "İş yeri ID zorunludur"],
    },
    date: {
      type: Date,
      required: [true, "Tarih zorunludur"],
    },
    wageOnThatDay: {
      type: Number,
      required: [true, "O günkü yevmiye zorunludur"],
      min: [0, "Yevmiye 0'dan küçük olamaz"],
    },
  },
  {
    timestamps: true,
  }
);

// Bir kullanıcının aynı güne tek bir kayıt ekleyebilmesi için birleşik unique index
WorkDaySchema.index({ userId: 1, date: 1 }, { unique: true });

// Sorgulama performansı için ek index'ler
WorkDaySchema.index({ userId: 1, date: -1 });
WorkDaySchema.index({ workplaceId: 1 });

const WorkDay =
  mongoose.models.WorkDay || mongoose.model<IWorkDay>("WorkDay", WorkDaySchema);

export default WorkDay;
