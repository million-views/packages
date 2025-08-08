// Generated builder DSL routes from metadata
import { route, index, layout, prefix, build, section } from "@m5nv/rr-builder";

export default build([
  section("specialist").nav({
    label: "Specialist",
    iconName: "User"
  }).children(
    layout("specialist/layout.tsx").children(
      ...prefix("specialists", [
        route("specialists", "specialists/store.tsx").nav({
            "label": "Specialist Profiles",
            "icon": "User"
          }),
        route("specialists/:id", "specialists/show.tsx").nav({
            "label": "Specialist Profile",
            "icon": "User"
          }),
        route("specialists/:id", "specialists/update.tsx"),
        route("specialists", "specialists/index.tsx").nav({
            "label": "Specialist Directory",
            "icon": "Users"
          }),
      ]),
      route("specialist-case-studies", "specialist-case-studies/store.tsx"),
      route("specialist-metrics/:id", "specialist-metrics/show.tsx").nav({
          "label": "Performance Metrics",
          "icon": "BarChart2"
        }),
      route("specialist-reports/:id", "specialist-reports/show.tsx").nav({
          "label": "Performance Report",
          "icon": "FileBarChart"
        }),
    )
  ),
  section("consultation").nav({
    label: "Consultation",
    iconName: "Briefcase"
  }).children(
    layout("consultation/layout.tsx").children(
      ...prefix("consultation-services", [
        route("consultation-services", "consultation-services/store.tsx").nav({
            "label": "Services",
            "icon": "Briefcase"
          }),
        route("consultation-services/:id", "consultation-services/show.tsx").nav({
            "label": "Service Details",
            "icon": "FileText"
          }),
        route("consultation-services/:id", "consultation-services/update.tsx"),
        route("consultation-services", "consultation-services/index.tsx").nav({
            "label": "Specialist Services",
            "icon": "Briefcase"
          }),
      ]),
      ...prefix("consultation-feedback", [
        route("consultation-feedback", "consultation-feedback/store.tsx").nav({
            "label": "Feedback",
            "icon": "Star"
          }),
        route("consultation-feedback/:id", "consultation-feedback/show.tsx"),
      ]),
      route("consultation-reminders", "consultation-reminders/store.tsx"),
    )
  ),
  layout("availability-patterns/layout.tsx").children(
    route("availability-patterns", "availability-patterns/store.tsx"),
    route("availability-patterns/:id", "availability-patterns/update.tsx"),
    route("availability-patterns/:id", "availability-patterns/destroy.tsx"),
  ),
  route("unavailability-blocks", "unavailability-blocks/store.tsx"),
  route("generated-slots", "generated-slots/index.tsx").nav({
      "label": "Available Slots",
      "icon": "Calendar"
    }),
  route("slot-holds", "slot-holds/store.tsx"),
  section("booking").nav({
    label: "Booking",
    iconName: "ClipboardCheck"
  }).children(
    layout("booking/layout.tsx").children(
      ...prefix("bookings", [
        route("bookings", "bookings/store.tsx"),
        route("bookings/:id", "bookings/show.tsx").nav({
            "label": "Booking Details",
            "icon": "ClipboardCheck"
          }),
        route("bookings", "bookings/index.tsx").nav({
            "label": "Bookings",
            "icon": "ClipboardList"
          }),
      ]),
      route("booking-cancellations", "booking-cancellations/store.tsx"),
      route("booking-reschedules", "booking-reschedules/store.tsx"),
    )
  ),
  route("expired-holds/:id", "expired-holds/destroy.tsx"),
  route("workshop-enrollments/:id", "workshop-enrollments/update.tsx"),
]);
