using MongoDB.Driver;
using Cars24Api.Models;

namespace Cars24Api.Services;

public static class SeedData
{
    public static async Task SeedAsync(MongoDbContext context)
    {
        var expectedCount = 30;

        if (context.IsMongoAvailable)
        {
            var carCount = await context.Cars.CountDocumentsAsync(_ => true);
            if (carCount >= expectedCount) return;
            if (carCount > 0)
                await context.Cars.DeleteManyAsync(_ => true);
            await context.Cars.InsertManyAsync(GetSampleCars());
        }
        else
        {
            if (context.InMemoryCars.Count >= expectedCount) return;
            context.InMemoryCars.Clear();
            context.InMemoryCars.AddRange(GetSampleCars());
            foreach (var car in context.InMemoryCars)
                car.Id = Guid.NewGuid().ToString("N").Substring(0, 24);
        }

        Console.WriteLine("[OK] Seeded {0} sample cars", expectedCount);
    }

    private static List<Car> GetSampleCars() => new()
    {
        // === HATCHBACKS ===
        new Car
        {
            Title = "2022 Maruti Suzuki Baleno Alpha",
            Brand = "Maruti Suzuki", Model = "Baleno", Year = 2022,
            Price = 850000, KmDriven = 15000, FuelType = "Petrol",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "MH02AB1234",
            Description = "Well maintained single owner car with all service records. Features include cruise control, touchscreen infotainment, and alloy wheels.",
            ImageUrl = "https://images.unsplash.com/photo-1611016186335-705c3d697e99?w=800&h=500&fit=crop",
            Location = "Mumbai", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-5)
        },
        new Car
        {
            Title = "2023 Maruti Suzuki Swift ZXI+",
            Brand = "Maruti Suzuki", Model = "Swift", Year = 2023,
            Price = 799000, KmDriven = 8000, FuelType = "Petrol",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "MH12CD5678",
            Description = "Sporty hatchback with peppy 1.2L DualJet engine. Dual airbags, ABS, and SmartPlay Pro infotainment.",
            ImageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop",
            Location = "Pune", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new Car
        {
            Title = "2021 Hyundai i20 Asta Turbo DCT",
            Brand = "Hyundai", Model = "i20", Year = 2021,
            Price = 950000, KmDriven = 20000, FuelType = "Petrol",
            Transmission = "DCT", NumberOfOwners = 1,
            RegistrationNumber = "DL08EF9012",
            Description = "Premium hatchback with 1.0L turbo GDi engine, 7-speed DCT, wireless charging, and 10.25-inch touchscreen.",
            ImageUrl = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop",
            Location = "Delhi", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new Car
        {
            Title = "2022 Tata Altroz XZ Plus",
            Brand = "Tata", Model = "Altroz", Year = 2022,
            Price = 820000, KmDriven = 18000, FuelType = "Petrol",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "GJ06GH3456",
            Description = "5-star safety rated hatchback with 1.2L turbo engine. RACER sport mode, ventilated seats, and iRA connected car tech.",
            ImageUrl = "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=500&fit=crop",
            Location = "Ahmedabad", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-6)
        },
        new Car
        {
            Title = "2023 Volkswagen Polo GT TSI",
            Brand = "Volkswagen", Model = "Polo", Year = 2023,
            Price = 990000, KmDriven = 5000, FuelType = "Petrol",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "KA03IJ7890",
            Description = "Fun to drive German hatchback with 1.0L TSI turbo engine. Build quality, safety, and handling are top-notch.",
            ImageUrl = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop",
            Location = "Bangalore", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-3)
        },

        // === SEDANS ===
        new Car
        {
            Title = "2022 Honda City ZX VTEC",
            Brand = "Honda", Model = "City", Year = 2022,
            Price = 1050000, KmDriven = 12000, FuelType = "Petrol",
            Transmission = "CVT", NumberOfOwners = 1,
            RegistrationNumber = "MH01KL2345",
            Description = "Sedan with Honda sensing ADAS, LED headlights, and premium interiors. Smooth CVT transmission for city driving.",
            ImageUrl = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop",
            Location = "Mumbai", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new Car
        {
            Title = "2023 Hyundai Verna SX(O) Turbo",
            Brand = "Hyundai", Model = "Verna", Year = 2023,
            Price = 1350000, KmDriven = 5000, FuelType = "Petrol",
            Transmission = "DCT", NumberOfOwners = 1,
            RegistrationNumber = "DL09MN6789",
            Description = "All-new Verna with 1.5L turbo GDi, ADAS, panoramic sunroof, dual screens, and Level 2 ADAS features.",
            ImageUrl = "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=500&fit=crop",
            Location = "Delhi", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-1)
        },
        new Car
        {
            Title = "2021 Skoda Slavia Style 1.5 TSI",
            Brand = "Skoda", Model = "Slavia", Year = 2021,
            Price = 1280000, KmDriven = 22000, FuelType = "Petrol",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "MH04OP0123",
            Description = "Premium European sedan with 1.5L TSI engine. Fun-to-drive dynamics, safety, and build quality.",
            ImageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop&sat=-100",
            Location = "Pune", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-7)
        },
        new Car
        {
            Title = "2022 Tata Tigor EV XZ Plus",
            Brand = "Tata", Model = "Tigor EV", Year = 2022,
            Price = 1100000, KmDriven = 12000, FuelType = "Electric",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "GJ01QR4567",
            Description = "Electric sedan with 306km range. Ziptron technology, fast charging capable, and zero emissions driving.",
            ImageUrl = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop",
            Location = "Ahmedabad", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-5)
        },

        // === SUVs ===
        new Car
        {
            Title = "2021 Hyundai Creta SX",
            Brand = "Hyundai", Model = "Creta", Year = 2021,
            Price = 1350000, KmDriven = 25000, FuelType = "Diesel",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "DL04CD5678",
            Description = "Premium SUV with panoramic sunroof, ventilated seats, and wireless charging. Excellent condition with full service history.",
            ImageUrl = "https://images.unsplash.com/photo-1606611013016-969c19ba27ff?w=800&h=500&fit=crop",
            Location = "Delhi", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-3)
        },
        new Car
        {
            Title = "2023 Tata Nexon EV Max",
            Brand = "Tata", Model = "Nexon EV", Year = 2023,
            Price = 1600000, KmDriven = 8000, FuelType = "Electric",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "KA01EF9012",
            Description = "Brand new electric SUV with 437km range. Fast charging capable with premium interior and connected car features.",
            ImageUrl = "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop",
            Location = "Bangalore", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-1)
        },
        new Car
        {
            Title = "2021 Mahindra Thar LX",
            Brand = "Mahindra", Model = "Thar", Year = 2021,
            Price = 1500000, KmDriven = 20000, FuelType = "Diesel",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "RJ14KL2345",
            Description = "Adventure-ready off-roader with convertible top. 4x4 with diff lock, perfect for weekend getaways.",
            ImageUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=500&fit=crop",
            Location = "Jaipur", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-6)
        },
        new Car
        {
            Title = "2023 Kia Seltos GT Line",
            Brand = "Kia", Model = "Seltos", Year = 2023,
            Price = 1450000, KmDriven = 5000, FuelType = "Petrol",
            Transmission = "DCT", NumberOfOwners = 1,
            RegistrationNumber = "UP16MN6789",
            Description = "Feature-loaded compact SUV with 10.25-inch touchscreen, BOSE audio, and 360-degree camera.",
            ImageUrl = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop",
            Location = "Lucknow", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-7)
        },
        new Car
        {
            Title = "2022 Volkswagen Taigun GT",
            Brand = "Volkswagen", Model = "Taigun", Year = 2022,
            Price = 1250000, KmDriven = 18000, FuelType = "Petrol",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "TS08OP0123",
            Description = "German engineering with 1.5L TSI engine. Fun to drive with premium build quality and safety features.",
            ImageUrl = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop",
            Location = "Hyderabad", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-8)
        },
        new Car
        {
            Title = "2023 Mahindra XUV700 AX7 Luxury",
            Brand = "Mahindra", Model = "XUV700", Year = 2023,
            Price = 2200000, KmDriven = 3000, FuelType = "Diesel",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "MH12QR4567",
            Description = "Flagship 7-seater SUV with ADAS, panoramic sunroof, Sony audio, and Alexa connected car. Premium luxury SUV.",
            ImageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop&hue=200",
            Location = "Mumbai", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new Car
        {
            Title = "2022 Toyota Fortuner Legender",
            Brand = "Toyota", Model = "Fortuner", Year = 2022,
            Price = 3500000, KmDriven = 15000, FuelType = "Diesel",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "DL05ST8901",
            Description = "Premium full-size SUV with 4x4, ventilated seats, power tailgate, and Toyota reliability. Beast on and off the road.",
            ImageUrl = "https://images.unsplash.com/photo-1594611731855-7d338e2d5e87?w=800&h=500&fit=crop",
            Location = "Delhi", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-10)
        },
        new Car
        {
            Title = "2023 Kia Carens Prestige Plus",
            Brand = "Kia", Model = "Carens", Year = 2023,
            Price = 1650000, KmDriven = 6000, FuelType = "Petrol",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "KA09UV2345",
            Description = "Premium 6-seater MPV with captain seats, 10.25-inch touchscreen, Bose audio, and ventilated front seats.",
            ImageUrl = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop&hue=180",
            Location = "Bangalore", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-3)
        },
        new Car
        {
            Title = "2022 MG Hector Sharp Pro",
            Brand = "MG", Model = "Hector", Year = 2022,
            Price = 1800000, KmDriven = 20000, FuelType = "Diesel",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "MH06WX6789",
            Description = "Internet SUV with 14-inch touchscreen, connected car tech, panoramic sunroof, and ADAS features.",
            ImageUrl = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop&hue=30",
            Location = "Pune", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-5)
        },

        // === COMPACT SUVs / CROSSOVERS ===
        new Car
        {
            Title = "2023 Tata Punch Creative",
            Brand = "Tata", Model = "Punch", Year = 2023,
            Price = 750000, KmDriven = 5000, FuelType = "Petrol",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "GJ03YZ0123",
            Description = "Micro SUV with 5-star safety. Compact, punchy, and perfect for city roads with high seating position.",
            ImageUrl = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop&hue=60",
            Location = "Ahmedabad", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new Car
        {
            Title = "2022 Renault Kiger RXZ Turbo CVT",
            Brand = "Renault", Model = "Kiger", Year = 2022,
            Price = 850000, KmDriven = 15000, FuelType = "Petrol",
            Transmission = "CVT", NumberOfOwners = 1,
            RegistrationNumber = "MH03AB4567",
            Description = "Compact SUV with turbo engine, wireless Android Auto, air purifier, and sporty design. Value for money.",
            ImageUrl = "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=500&fit=crop&hue=30",
            Location = "Mumbai", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-6)
        },
        new Car
        {
            Title = "2023 Nissan Magnite XV Premium",
            Brand = "Nissan", Model = "Magnite", Year = 2023,
            Price = 780000, KmDriven = 4000, FuelType = "Petrol",
            Transmission = "CVT", NumberOfOwners = 1,
            RegistrationNumber = "DL07CD8901",
            Description = "Affordable turbo SUV with premium features. Wireless phone mirroring, JBL audio, and 360-degree camera.",
            ImageUrl = "https://images.unsplash.com/photo-1606611013016-969c19ba27ff?w=800&h=500&fit=crop&hue=40",
            Location = "Delhi", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-8)
        },

        // === MPV ===
        new Car
        {
            Title = "2020 Toyota Innova Crysta GX",
            Brand = "Toyota", Model = "Innova Crysta", Year = 2020,
            Price = 1800000, KmDriven = 40000, FuelType = "Diesel",
            Transmission = "Manual", NumberOfOwners = 2,
            RegistrationNumber = "TN09GH3456",
            Description = "Spacious 7-seater MPV perfect for families. Known for reliability and low maintenance costs.",
            ImageUrl = "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=500&fit=crop",
            Location = "Chennai", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-2)
        },
        new Car
        {
            Title = "2022 Maruti Suzuki Ertiga ZDI Plus",
            Brand = "Maruti Suzuki", Model = "Ertiga", Year = 2022,
            Price = 1150000, KmDriven = 22000, FuelType = "Diesel",
            Transmission = "Manual", NumberOfOwners = 1,
            RegistrationNumber = "KA02EF2345",
            Description = "Best-selling 7-seater with diesel efficiency. Smart hybrid, touchscreen, and rear parking camera.",
            ImageUrl = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop&hue=120",
            Location = "Bangalore", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-9)
        },

        // === LUXURY ===
        new Car
        {
            Title = "2021 Hyundai Tucson Signature AWD",
            Brand = "Hyundai", Model = "Tucson", Year = 2021,
            Price = 2500000, KmDriven = 18000, FuelType = "Diesel",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "MH01GH6789",
            Description = "Premium SUV with AWD, panoramic sunroof, ventilated seats, and 360-degree camera. Flagship Hyundai offering.",
            ImageUrl = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop&hue=20",
            Location = "Mumbai", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-12)
        },
        new Car
        {
            Title = "2022 MG Astor Savvy Pro",
            Brand = "MG", Model = "Astor", Year = 2022,
            Price = 1550000, KmDriven = 10000, FuelType = "Petrol",
            Transmission = "CVT", NumberOfOwners = 1,
            RegistrationNumber = "DL12IJ0123",
            Description = "AI-powered SUV with Level 2 ADAS, personal AI assistant, panoramic sunroof, and 10.1-inch touchscreen.",
            ImageUrl = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop&hue=60",
            Location = "Delhi", SellerId = "seed", IsVerified = false,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-4)
        },

        // === ELECTRIC ===
        new Car
        {
            Title = "2023 MG ZS EV Exclusive",
            Brand = "MG", Model = "ZS EV", Year = 2023,
            Price = 2200000, KmDriven = 3000, FuelType = "Electric",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "MH05KL4567",
            Description = "Premium electric SUV with 461km range. Fast charging, panoramic sunroof, and connected car features.",
            ImageUrl = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop&hue=120",
            Location = "Pune", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-7)
        },
        new Car
        {
            Title = "2022 Tata Nexon AMT XZ Plus",
            Brand = "Tata", Model = "Nexon", Year = 2022,
            Price = 1100000, KmDriven = 15000, FuelType = "Diesel",
            Transmission = "Automatic", NumberOfOwners = 1,
            RegistrationNumber = "TN04MN8901",
            Description = "Compact SUV with 5-star safety, AMT gearbox, sunroof, and Harman infotainment. Great for city and highway.",
            ImageUrl = "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop&hue=30",
            Location = "Chennai", SellerId = "seed", IsVerified = true,
            IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-3)
        },
    };
}
