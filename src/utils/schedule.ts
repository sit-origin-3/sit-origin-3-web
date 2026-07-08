export interface ScheduleItem {
  id: string;
  time: string;
  titleKey: string;
  locationKey: string;
}

export function getScheduleForGroup(group: string): ScheduleItem[] {
  const normalizedGroup = ["A1", "A2", "A3", "A4", "A5"].includes(group) ? group : "A1";

  const timeline: ScheduleItem[] = [
    { id: "s-open", time: "09:45 - 10:30", titleKey: "home.schedule.open", locationKey: "home.schedule.lxAuditorium" },
  ];

  if (["A1", "A2", "A3"].includes(normalizedGroup)) {
    timeline.push({ id: "s-ice1", time: "10:40 - 10:55", titleKey: "home.schedule.iceBreaking1", locationKey: "home.schedule.lx2" });
    timeline.push({ id: "s-ice2", time: "11:00 - 11:15", titleKey: "home.schedule.iceBreaking2", locationKey: "home.schedule.lx3" });
  } else {
    timeline.push({ id: "s-ice2", time: "10:40 - 10:55", titleKey: "home.schedule.iceBreaking2", locationKey: "home.schedule.lx3" });
    timeline.push({ id: "s-ice1", time: "11:00 - 11:15", titleKey: "home.schedule.iceBreaking1", locationKey: "home.schedule.lx2" });
  }

  timeline.push(
    { id: "s-snack", time: "11:15 - 11:25", titleKey: "home.schedule.snack", locationKey: "home.schedule.lx10" },
    { id: "s-talk", time: "11:25 - 12:25", titleKey: "home.schedule.talk", locationKey: "home.schedule.lx10" },
    { id: "s-lunch", time: "12:20 - 13:15", titleKey: "home.schedule.lunch", locationKey: "home.schedule.lx10" },
    { id: "s-gather", time: "13:15 - 13:30", titleKey: "home.schedule.gather", locationKey: "home.schedule.lx3" }
  );

  const stations = {
    S1: { title: "home.schedule.station1", location: "home.schedule.cb2301" },
    S2: { title: "home.schedule.station2", location: "home.schedule.cb2306" },
    S3: { title: "home.schedule.station3", location: "home.schedule.cb2304" },
    S4: { title: "home.schedule.station4", location: "home.schedule.cb2305" },
    S5: { title: "home.schedule.station5", location: "home.schedule.cb2312" }
  };

  const groupOrders: Record<string, (keyof typeof stations)[]> = {
    A1: ["S1", "S2", "S3", "S4", "S5"],
    A2: ["S2", "S3", "S4", "S5", "S1"],
    A3: ["S3", "S4", "S5", "S1", "S2"],
    A4: ["S4", "S5", "S1", "S2", "S3"],
    A5: ["S5", "S1", "S2", "S3", "S4"],
  };

  const slots = [
    "13:45 - 14:00",
    "14:05 - 14:20",
    "14:25 - 14:40",
    "14:45 - 15:00",
    "15:05 - 15:20"
  ];

  const order = groupOrders[normalizedGroup];
  order.forEach((stationKey, index) => {
    timeline.push({
      id: `s-station-${index}`,
      time: slots[index],
      titleKey: stations[stationKey].title,
      locationKey: stations[stationKey].location
    });
  });

  timeline.push({ id: "s-close", time: "15:35 - 16:30", titleKey: "home.schedule.close", locationKey: "home.schedule.lxAuditorium" });

  return timeline;
}
