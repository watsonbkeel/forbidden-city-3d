/** Transcribed measurement records from H01 (2006), never current-condition acceptance.
 * Museum photographs/PDF pages remain research-only and are not runtime assets.
 */
export const PAVILION_MEASUREMENTS = {
  "schema": "palace.pavilion-measured-profiles.v1",
  "reviewed_at": "2026-10-14",
  "units": "metres unless specified",
  "survey_publication_year": 2006,
  "current_condition_2026_accepted": false,
  "sources": {
    "H01": {
      "url": "https://www.dpm.org.cn/Uploads/File/2019/11/14/u5dcd2fd72ceee.pdf",
      "title": "故宫弘义阁、体仁阁研究",
      "author": "杨新成",
      "sha256": "85c6359130fb2438123a65d5ea68c0d07542ee42a55f6c2a9a3066856e5964b7",
      "pdf_to_printed_page_offset": 121
    },
    "S13": {
      "url": "https://www.dpm.org.cn/explore/building/236491.html",
      "photo": "https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg",
      "photo_capture_date": null
    },
    "S12": {
      "url": "https://www.dpm.org.cn/explore/building/236453.html",
      "photo": "https://img.dpm.org.cn/Uploads/Picture/dc/1534%5B1024%5D.jpg",
      "photo_capture_date": null,
      "photo_sha256": "8754a179efd12d10002c5f549a5e6d01070bacff4f62696953deeff1249cb8af"
    }
  },
  "measurement_convention": {
    "vertical_zero": "lower interior floor of each pavilion",
    "plan_zero": "central width bay center and drawn depth centerline",
    "plan_u": "page-left to page-right in front-down plans",
    "plan_v": "toward rear",
    "spans": "column centerlines unless expressly stated",
    "survey_absolute_floor_label": {
      "value": 48.99,
      "unit": "m",
      "datum": "unidentified; not world Y",
      "sources": [
        {
          "source": "H01",
          "figure": 1,
          "printed_page": 170,
          "pdf_page": 49
        },
        {
          "source": "H01",
          "figure": 2,
          "printed_page": 171,
          "pdf_page": 50
        }
      ]
    },
    "dimension_ticks": "Mixed reference chains include principal-column ticks; do not place outer square posts at every tick."
  },
  "evidenced_measurements": {
    "hongyi": {
      "lower": {
        "principal_span": {
          "value": [
            43.68,
            16.704
          ],
          "unit": "m",
          "object": "outer principal column centerlines",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 1,
          "printed_page": 170,
          "pdf_page": 49
        },
        "width_intervals": {
          "value": [
            4.32,
            4.768,
            4.768,
            4.768,
            6.432,
            4.768,
            4.768,
            4.768,
            4.32
          ],
          "unit": "m",
          "object": "nine principal bays",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 1,
          "printed_page": 170,
          "pdf_page": 49
        },
        "depth_intervals": {
          "value": [
            4.32,
            8.064,
            4.32
          ],
          "unit": "m",
          "object": "three principal depth bays",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 1,
          "printed_page": 170,
          "pdf_page": 49
        }
      },
      "upper": {
        "rear_outer_support_chain": {
          "value": [
            1.408,
            2.24,
            4.8,
            4.8,
            4.8,
            6.24,
            4.8,
            4.8,
            4.8,
            2.24,
            1.408
          ],
          "unit": "m",
          "object": "page-left to page-right; endpoint small-square gallery post centers",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "rear_outer_support_width": {
          "value": 42.336,
          "unit": "m",
          "object": "outer small-square gallery post span",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "front_principal_chain": {
          "value": [
            2.2,
            4.76,
            4.76,
            4.86,
            6.26,
            4.86,
            4.76,
            4.76,
            2.2
          ],
          "unit": "m",
          "object": "front large-round principal columns, including enclosed end intervals",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "front_principal_width": {
          "value": 39.42,
          "unit": "m",
          "object": "front round corner-column span",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "rear_principal_width": {
          "value": 39.52,
          "unit": "m",
          "object": "rear round corner-column span",
          "status": "DERIVED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53,
          "expression": "42.336 - 2*1.408"
        },
        "front_seven_opening_bay_run": {
          "value": 35.02,
          "unit": "m",
          "object": "seven central bay centerline spans, not leaf clearances",
          "status": "DERIVED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53,
          "expression": "39.420 - 2*2.200"
        },
        "center_to_rear_outer_support_chain": {
          "value": [
            4.032,
            2.176,
            1.408
          ],
          "unit": "m",
          "object": "drawn depth centerline to rear outer post center",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "center_to_front_outer_support_chain": {
          "value": [
            4.02,
            2.2,
            1.408
          ],
          "unit": "m",
          "object": "drawn depth centerline to front outer post center",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "outer_support_depth": {
          "value": 15.244,
          "unit": "m",
          "object": "front-to-rear outer square-post centers",
          "status": "DERIVED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53,
          "expression": "7.616 + 7.628"
        },
        "principal_depth": {
          "value": 12.428,
          "unit": "m",
          "object": "front-to-rear main enclosure column centers",
          "status": "DERIVED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53,
          "expression": "15.244 - 2*1.408"
        },
        "principal_depth_line_coordinates": {
          "value": [
            -6.22,
            6.208
          ],
          "unit": "m",
          "object": "front/rear relative to drawn depth centerline",
          "status": "DERIVED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        },
        "outer_support_depth_line_coordinates": {
          "value": [
            -7.628,
            7.616
          ],
          "unit": "m",
          "object": "front/rear relative to drawn depth centerline",
          "status": "DERIVED",
          "source": "H01",
          "figure": 5,
          "printed_page": 174,
          "pdf_page": 53
        }
      },
      "elevations": {
        "interior_floor": {
          "value": 0,
          "unit": "m",
          "object": "lower interior floor",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "front_court": {
          "value": -3.8,
          "unit": "m",
          "object": "front court pavement",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "rear_ground": {
          "value": -3.77,
          "unit": "m",
          "object": "rear ground",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "lower_eave": {
          "value": 6.285,
          "unit": "m",
          "object": "drawn lower-eave reference",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "upper_floor": {
          "value": 9.64,
          "unit": "m",
          "object": "upper interior wood-floor surface",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "upper_eave": {
          "value": 13.58,
          "unit": "m",
          "object": "drawn upper-eave reference",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "ridge": {
          "value": 20.11,
          "unit": "m",
          "object": "ridge reference, not topmost ornament",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        }
      },
      "terrace_spot_elevations": {
        "central_front": {
          "value": -0.1,
          "unit": "m",
          "object": "central terrace paving in front of doorway",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 1,
          "printed_page": 170,
          "pdf_page": 49
        },
        "side_spots": {
          "value": [
            -0.19,
            -0.24
          ],
          "unit": "m",
          "object": "two labeled side-paving spots, not a uniform terrace datum",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 1,
          "printed_page": 170,
          "pdf_page": 49
        }
      },
      "waist_layer": {
        "stair_landing_elevation": {
          "value": 7.3,
          "unit": "m",
          "object": "stair/landing annotation in intermediate structural-layer plan",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 3,
          "printed_page": 172,
          "pdf_page": 51
        },
        "rear_short_column_width": {
          "value": 41.6,
          "unit": "m",
          "object": "rear outer short-column support line",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 3,
          "printed_page": 172,
          "pdf_page": 51
        },
        "short_column_depth": {
          "value": 14.496,
          "unit": "m",
          "object": "outer intermediate short-column support depth",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 3,
          "printed_page": 172,
          "pdf_page": 51
        }
      },
      "gallery_detail": {
        "rail_top_above_coping": {
          "value": 0.8,
          "unit": "m",
          "object": "rail top above coping top",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 7,
          "printed_page": 176,
          "pdf_page": 55
        },
        "post_finial_above_coping": {
          "value": 1.02,
          "unit": "m",
          "object": "rail-post finial above coping top",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 7,
          "printed_page": 176,
          "pdf_page": 55
        },
        "coping_band": {
          "value": 0.13,
          "unit": "m",
          "object": "coping vertical band in detail",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 7,
          "printed_page": 176,
          "pdf_page": 55
        },
        "hanging_fascia_height": {
          "value": 0.765,
          "unit": "m",
          "object": "glazed hanging-fascia elevation height",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 7,
          "printed_page": 176,
          "pdf_page": 55
        }
      },
      "overview_height": {
        "value": 23.8,
        "unit": "m",
        "object": "official overview height, endpoints unspecified",
        "status": "OFFICIAL_UNSPECIFIED_DATUM",
        "source": "S13"
      },
      "derived_elevation_differences": {
        "upper_floor_to_upper_eave": {
          "value": 3.94,
          "unit": "m",
          "object": "upper eave reference minus interior upper floor; not column clear height",
          "status": "DERIVED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "ridge_to_upper_eave": {
          "value": 6.53,
          "unit": "m",
          "object": "ridge reference minus upper eave reference",
          "status": "DERIVED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "upper_floor_above_lower_eave": {
          "value": 3.355,
          "unit": "m",
          "object": "upper floor minus lower eave; structural zone is present",
          "status": "DERIVED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        },
        "ridge_above_front_court": {
          "value": 23.91,
          "unit": "m",
          "object": "ridge minus front courtyard; not overview total-height substitute",
          "status": "DERIVED",
          "source": "H01",
          "figure": 9,
          "printed_page": 178,
          "pdf_page": 57
        }
      }
    },
    "tiren": {
      "lower": {
        "principal_span": {
          "value": [
            43.712,
            16.736
          ],
          "unit": "m",
          "object": "outer principal column centerlines",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 2,
          "printed_page": 171,
          "pdf_page": 50
        },
        "width_intervals": {
          "value": [
            4.32,
            4.768,
            4.768,
            4.768,
            6.464,
            4.768,
            4.768,
            4.768,
            4.32
          ],
          "unit": "m",
          "object": "principal bays, with end and central subdivisions summed",
          "status": "DERIVED",
          "source": "H01",
          "figure": 2,
          "printed_page": 171,
          "pdf_page": 50
        },
        "depth_intervals": {
          "value": [
            4.32,
            8.096,
            4.32
          ],
          "unit": "m",
          "object": "principal depth bays from subsidiary chain",
          "status": "DERIVED",
          "source": "H01",
          "figure": 2,
          "printed_page": 171,
          "pdf_page": 50
        }
      },
      "upper": {
        "rear_outer_support_chain": {
          "value": [
            1.48,
            2.304,
            4.768,
            4.768,
            4.768,
            6.464,
            4.768,
            4.768,
            4.768,
            2.304,
            1.48
          ],
          "unit": "m",
          "object": "page-left to page-right; endpoint small-square gallery post centers",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "front_outer_support_chain": {
          "value": [
            1.48,
            2.308,
            4.768,
            4.768,
            4.768,
            6.464,
            4.768,
            4.768,
            4.768,
            2.304,
            1.48
          ],
          "unit": "m",
          "object": "page-left to page-right; endpoint small-square gallery post centers",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "rear_outer_support_width": {
          "value": 42.64,
          "unit": "m",
          "object": "rear outer gallery post span",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "front_outer_support_width": {
          "value": 42.644,
          "unit": "m",
          "object": "front outer gallery post span",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "rear_principal_width": {
          "value": 39.68,
          "unit": "m",
          "object": "rear round corner-column span",
          "status": "DERIVED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54,
          "expression": "42.640 - 2*1.480"
        },
        "front_principal_width": {
          "value": 39.684,
          "unit": "m",
          "object": "front round corner-column span",
          "status": "DERIVED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54,
          "expression": "42.644 - 2*1.480"
        },
        "front_seven_opening_bay_run": {
          "value": 35.072,
          "unit": "m",
          "object": "seven central bay centerline spans, not leaf clearances",
          "status": "DERIVED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54,
          "expression": "6*4.768 + 6.464"
        },
        "center_to_each_outer_support_depth_chain": {
          "value": [
            2.032,
            2.016,
            2.272,
            1.48
          ],
          "unit": "m",
          "object": "drawn depth centerline to front or rear outer post center",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "outer_support_depth": {
          "value": 15.6,
          "unit": "m",
          "object": "front-to-rear outer square-post centers",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "principal_depth": {
          "value": 12.64,
          "unit": "m",
          "object": "front-to-rear main enclosure column centers",
          "status": "DERIVED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54,
          "expression": "15.600 - 2*1.480"
        },
        "principal_depth_line_coordinates": {
          "value": [
            -6.32,
            6.32
          ],
          "unit": "m",
          "object": "front/rear relative to drawn depth centerline",
          "status": "DERIVED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        },
        "outer_support_depth_line_coordinates": {
          "value": [
            -7.8,
            7.8
          ],
          "unit": "m",
          "object": "front/rear relative to drawn depth centerline",
          "status": "DERIVED",
          "source": "H01",
          "figure": 6,
          "printed_page": 175,
          "pdf_page": 54
        }
      },
      "elevations": {
        "interior_floor": {
          "value": 0,
          "unit": "m",
          "object": "lower interior floor",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "front_court": {
          "value": -3.8,
          "unit": "m",
          "object": "front court pavement",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "rear_ground": {
          "value": -3.77,
          "unit": "m",
          "object": "rear ground",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "lower_eave": {
          "value": 6.35,
          "unit": "m",
          "object": "drawn lower-eave reference",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "upper_floor": {
          "value": 9.795,
          "unit": "m",
          "object": "upper interior wood-floor surface",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "upper_eave": {
          "value": 13.91,
          "unit": "m",
          "object": "drawn upper-eave reference",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "ridge": {
          "value": 20.26,
          "unit": "m",
          "object": "ridge reference, not topmost ornament",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "stair_wood_platform": {
          "value": 0.255,
          "unit": "m",
          "object": "small interior wooden platform by stair, not terrace",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        }
      },
      "waist_layer": {
        "stair_landing_elevation": {
          "value": 7.445,
          "unit": "m",
          "object": "stair/landing annotation in intermediate structural-layer plan",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 4,
          "printed_page": 173,
          "pdf_page": 52
        },
        "short_column_span": {
          "value": [
            41.65,
            14.61
          ],
          "unit": "m",
          "object": "intermediate outer short-column support grid",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 4,
          "printed_page": 173,
          "pdf_page": 52
        },
        "peripheral_short_column_offset": {
          "value": 0.985,
          "unit": "m",
          "object": "principal column to intermediate outer short-column line",
          "status": "DIMENSIONED",
          "source": "H01",
          "figure": 4,
          "printed_page": 173,
          "pdf_page": 52
        }
      },
      "overview_height": {
        "value": 25,
        "unit": "m",
        "object": "official overview height, endpoints unspecified",
        "status": "OFFICIAL_UNSPECIFIED_DATUM",
        "source": "S12"
      },
      "derived_elevation_differences": {
        "upper_floor_to_upper_eave": {
          "value": 4.115,
          "unit": "m",
          "object": "upper eave reference minus interior upper floor; not column clear height",
          "status": "DERIVED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "ridge_to_upper_eave": {
          "value": 6.35,
          "unit": "m",
          "object": "ridge reference minus upper eave reference",
          "status": "DERIVED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "upper_floor_above_lower_eave": {
          "value": 3.445,
          "unit": "m",
          "object": "upper floor minus lower eave; structural zone is present",
          "status": "DERIVED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        },
        "ridge_above_front_court": {
          "value": 24.06,
          "unit": "m",
          "object": "ridge minus front courtyard; not overview total-height substitute",
          "status": "DERIVED",
          "source": "H01",
          "figure": 10,
          "printed_page": 179,
          "pdf_page": 58
        }
      }
    }
  },
  "shared_narrative_measurements": {
    "scope": "H01 two-pavilion section; not two independent dimension chains",
    "terrace_north_south_length": {
      "value": 63.3,
      "unit": "m",
      "object": "shared terrace summary",
      "status": "TEXT_APPROX",
      "source": "H01",
      "printed_page": 138,
      "pdf_page": 17
    },
    "terrace_east_west_depth": {
      "value": 27.5,
      "unit": "m",
      "object": "shared terrace summary",
      "status": "TEXT_APPROX",
      "source": "H01",
      "printed_page": 138,
      "pdf_page": 17
    },
    "terrace_above_front_court": {
      "value": 3.7,
      "unit": "m",
      "object": "approximately, shared terrace summary",
      "status": "TEXT_APPROX",
      "source": "H01",
      "printed_page": 138,
      "pdf_page": 17
    },
    "terrace_above_adjacent_veranda_platforms": {
      "value": 0.9,
      "unit": "m",
      "object": "approximately, shared terrace summary",
      "status": "TEXT_APPROX",
      "source": "H01",
      "printed_page": 138,
      "pdf_page": 17
    },
    "center_carved_strip_width": {
      "value": 2.3,
      "unit": "m",
      "object": "imperial stone strip between two front step flights",
      "status": "TEXT_APPROX",
      "source": "H01",
      "printed_page": 139,
      "pdf_page": 18
    },
    "side_connections_width": {
      "value": 4.9,
      "unit": "m",
      "object": "south steps and north ridged incline; shared description",
      "status": "TEXT_APPROX",
      "source": "H01",
      "printed_page": 139,
      "pdf_page": 18
    },
    "front_step_count_each_flanking_flight": {
      "value": 32,
      "unit": "steps",
      "source": "H01",
      "printed_page": 139,
      "pdf_page": 18,
      "status": "TEXT"
    },
    "hongyi_interior_stair_guard_height": {
      "value": 0.53,
      "unit": "m",
      "object": "interior stair opening guard, NOT exterior gallery rail",
      "status": "TEXT",
      "source": "H01",
      "printed_page": 142,
      "pdf_page": 21
    }
  },
  "unresolved_source_observations": [
    {
      "id": "hongyi_waist_front_chain_conflict",
      "source": {
        "source": "H01",
        "figure": 3,
        "printed_page": 172,
        "pdf_page": 51
      },
      "printed_total_m": 40.573,
      "visible_chain_m": [
        1.04,
        2.24,
        4.768,
        4.768,
        4.768,
        6.419,
        4.768,
        4.768,
        4.768,
        2.24,
        1.04
      ],
      "chain_sum_m": 41.587,
      "status": "CONFLICT_DO_NOT_IMPLEMENT_AS_SURVEYED"
    },
    {
      "id": "hongyi_upper_front_outer_support_width",
      "source": {
        "source": "H01",
        "figure": 5,
        "printed_page": 174,
        "pdf_page": 53
      },
      "value": null,
      "reason": "front chain endpoints are round principal columns; rear outer width cannot be copied forward"
    },
    {
      "id": "tiren_terrace_paving_level",
      "source": {
        "source": "H01",
        "figure": 2,
        "printed_page": 171,
        "pdf_page": 50
      },
      "value": null,
      "reason": "no readable terrace spot equivalent to Hongyi -0.100; +0.255 is interior stair wood platform"
    }
  ],
  "provisional_implementation_fields": {
    "status": "PROVISIONAL_NOT_SURVEYED",
    "suggested_transform": {
      "xLocal": "-u",
      "zLocal": "v",
      "yWorld": "selectedInteriorFloorWorldY + surveyY",
      "rotation": "existing east Hongyi / west Tiren; confirm north arrows"
    },
    "optional_front_court_zero": {
      "frontCourtWorldY": 0,
      "interiorFloorWorldY": 3.8,
      "status": "DATUM_CHOICE_NOT_NEW_MEASUREMENT"
    },
    "terrace_summary_adoption_each_pavilion": null,
    "hongyi_front_outer_support_width": null,
    "hongyi_waist_front_support_width": null,
    "tiren_terrace_paving_elevation": null,
    "roof_eave_outline_each_pavilion": null,
    "upper_deck_edge_outline_each_pavilion": null,
    "upper_gallery_outer_floor_elevation_each_pavilion": null,
    "roof_generator_base_parameter_each_pavilion": null,
    "roof_curve_and_ornament_extents_each_pavilion": null,
    "platform_boundary_and_building_offset_each_pavilion": null,
    "front_approach_run_and_overall_width_each_pavilion": null,
    "side_stair_and_incline_runs_each_pavilion": null,
    "wall_and_column_thickness_each_pavilion": null,
    "present_day_rear_photo_acceptance": "UNKNOWN",
    "notes": [
      "Retain source arrays. Any rectification of front/rear differences must be separately labeled.",
      "Do not mirror dimensions or convert seven opening bays into a 7/9-width enclosure.",
      "Keep current anchors unless a separately authorized alignment task changes them.",
      "Museum references are research-only; no runtime redistribution approval.",
      "Outer gallery support schedule is 10 front + 10 rear + 2 intermediate posts per end, corners counted once; chain ticks include other frame lines."
    ]
  }
};
