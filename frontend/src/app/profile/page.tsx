"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { carsAPI, appointmentsAPI, authAPI } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pencil, PlusCircle, Trash2, Eye } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  location: string;
}

interface Appointment {
  id: string;
  car: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  } | null;
  date: string;
  time: string;
  location: string;
  status: string;
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setProfileData({ name: user.name, phone: user.phone });
    loadData();
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsRes, appointmentsRes] = await Promise.all([
        carsAPI.getMyListings(),
        appointmentsAPI.getMy(),
      ]);
      setListings(listingsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data);
      setEditing(false);
    } catch {
      alert("Failed to update profile");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await carsAPI.delete(id);
      setListings((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete listing");
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentsAPI.delete(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to cancel appointment");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-4 border-2 border-blue-400">
            <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="listings">
              Listings ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="appointments">
              Appointments ({appointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={user.email} disabled className="mt-1" />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-orange-600"
                    >
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: "Name", value: user.name },
                      { label: "Email", value: user.email },
                      { label: "Phone", value: user.phone || "Not provided" },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-sm text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Separator className="my-6" />

                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Listings</CardTitle>
                <Link href="/sell">
                  <Button size="sm" className="bg-blue-600 hover:bg-orange-600">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Loading...
                  </p>
                ) : listings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t listed any cars yet.
                    </p>
                    <Link href="/sell">
                      <Button className="bg-blue-600 hover:bg-orange-600">
                        Sell Your Car
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((car) => (
                      <div
                        key={car.id}
                        className="flex gap-4 p-4 border rounded-xl"
                      >
                        <img
                          src={car.imageUrl}
                          alt={car.title}
                          className="w-28 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold">{car.title}</h3>
                          <p className="text-blue-600 font-bold">
                            ₹{car.price.toLocaleString("en-IN")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            📍 {car.location}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href={`/car/${car.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteListing(car.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Loading...
                  </p>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No appointments scheduled yet.
                    </p>
                    <Link href="/buy">
                      <Button className="bg-blue-600 hover:bg-orange-600">
                        Browse Cars
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="border rounded-xl p-4">
                        {apt.car && (
                          <div className="flex gap-4 mb-4 pb-4 border-b">
                            <img
                              src={apt.car.imageUrl}
                              alt={apt.car.title}
                              className="w-24 h-18 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-bold">{apt.car.title}</h4>
                              <p className="text-blue-600 font-bold">
                                ₹{apt.car.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">
                              {new Date(apt.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time: </span>
                            <span className="font-medium">{apt.time}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Location:{" "}
                            </span>
                            <span className="font-medium">{apt.location}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status: </span>
                            <Badge
                              variant={
                                apt.status === "Confirmed"
                                  ? "default"
                                  : apt.status === "Cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {apt.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel Appointment
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
