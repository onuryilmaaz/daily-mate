import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.model";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, surname } = await req.json();

    // Giriş verilerini doğrula
    if (!email || !name || !surname) {
      return NextResponse.json(
        { error: "E-posta, isim ve soyisim zorunludur" },
        { status: 400 }
      );
    }

    // Password sadece credentials provider için zorunlu
    if (!password) {
      return NextResponse.json({ error: "Şifre zorunludur" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // E-posta formatını doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 }
      );
    }

    // İsim ve soyisim uzunluk kontrolü
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "İsim en az 2 karakter olmalıdır" },
        { status: 400 }
      );
    }

    if (surname.trim().length < 2) {
      return NextResponse.json(
        { error: "Soyisim en az 2 karakter olmalıdır" },
        { status: 400 }
      );
    }

    await connectDB();

    // E-postanın daha önce kullanılıp kullanılmadığını kontrol et
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni kullanıcıyı oluştur
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      surname: surname.trim(),
      provider: "credentials",
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla oluşturuldu",
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          surname: newUser.surname,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
